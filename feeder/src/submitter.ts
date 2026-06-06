import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  Networks,
  TransactionBuilder,
  nativeToScVal,
  rpc,
} from "@stellar/stellar-sdk";
import type { Config } from "./config";

const TX_TIMEOUT_SECONDS = 30;
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30_000;

function networkPassphrase(network: Config["network"]): string {
  return network === "mainnet" ? Networks.PUBLIC : Networks.TESTNET;
}

async function waitForConfirmation(
  server: rpc.Server,
  hash: string
): Promise<rpc.Api.GetSuccessfulTransactionResponse> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const result = await server.getTransaction(hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return result;
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error(`Transaction ${hash} failed`);
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  throw new Error(`Timed out waiting for transaction ${hash} to confirm`);
}

/**
 * Build and submit a Soroban transaction that calls
 * PulsarOracle.submit(feeder, feed_id, value) on Stellar.
 */
export async function submitFeedValue(
  config: Config,
  feedId: string,
  value: bigint
): Promise<string> {
  const server = new rpc.Server(config.rpcUrl);
  const keypair = Keypair.fromSecret(config.secretKey);
  const feederAddress = Address.fromString(keypair.publicKey());

  const account = await server.getAccount(keypair.publicKey());
  const contract = new Contract(config.contractId);

  const operation = contract.call(
    "submit",
    feederAddress.toScVal(),
    nativeToScVal(feedId, { type: "symbol" }),
    nativeToScVal(value, { type: "i128" })
  );

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: networkPassphrase(config.network),
  })
    .addOperation(operation)
    .setTimeout(TX_TIMEOUT_SECONDS)
    .build();

  const prepared = await server.prepareTransaction(transaction);
  prepared.sign(keypair);

  const sendResult = await server.sendTransaction(prepared);
  if (sendResult.status === "ERROR") {
    throw new Error(
      `Failed to submit transaction for ${feedId}: ${sendResult.status}`
    );
  }

  await waitForConfirmation(server, sendResult.hash);
  return sendResult.hash;
}
