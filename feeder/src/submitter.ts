import type { Config } from "./config";

/**
 * Build and submit a Soroban transaction that calls
 * PulsarOracle.submit(feeder, feed_id, value) on Stellar.
 */
export async function submitFeedValue(
  config: Config,
  feedId: string,
  value: bigint
): Promise<string> {
  console.log(`[${feedId}] Submitting value: ${value}`);
  // TODO: build Soroban transaction using @stellar/stellar-sdk
  // TODO: sign with config.secretKey
  // TODO: submit to config.rpcUrl
  // TODO: return transaction hash
  throw new Error("submitFeedValue not yet implemented");
}
