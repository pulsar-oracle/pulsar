// Feeder node configuration — loaded from environment variables

export interface Config {
  network: "testnet" | "mainnet";
  rpcUrl: string;
  contractId: string;
  secretKey: string;
  intervalSeconds: number;
  activeFeeds: string[];
}

function parseNetwork(value: string | undefined): "testnet" | "mainnet" {
  const network = value ?? "testnet";
  if (network !== "testnet" && network !== "mainnet") {
    throw new Error(
      `Invalid STELLAR_NETWORK: "${network}" (expected "testnet" or "mainnet")`
    );
  }
  return network;
}

function parseIntervalSeconds(value: string | undefined): number {
  const interval = parseInt(value ?? "60", 10);
  if (!Number.isFinite(interval) || interval <= 0) {
    throw new Error(`Invalid SUBMISSION_INTERVAL: "${value}"`);
  }
  return interval;
}

export function loadConfig(): Config {
  const required = (key: string): string => {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
  };

  return {
    network: parseNetwork(process.env.STELLAR_NETWORK),
    rpcUrl: process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
    contractId: required("PULSAR_CONTRACT_ID"),
    secretKey: required("FEEDER_SECRET_KEY"),
    intervalSeconds: parseIntervalSeconds(process.env.SUBMISSION_INTERVAL),
    activeFeeds: (process.env.ACTIVE_FEEDS ?? "XLM_USD").split(",").map((f) => f.trim()),
  };
}

/** Return the Horizon URL for the current network */
export function horizonUrl(config: Config): string {
  return config.network === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}
