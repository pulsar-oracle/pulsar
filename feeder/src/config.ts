// Feeder node configuration — loaded from environment variables

export interface Config {
  network: "testnet" | "mainnet";
  rpcUrl: string;
  contractId: string;
  secretKey: string;
  intervalSeconds: number;
  activeFeeds: string[];
}

export function loadConfig(): Config {
  const required = (key: string): string => {
    const val = process.env[key];
    if (!val) throw new Error(`Missing required env var: ${key}`);
    return val;
  };

  return {
    network: (process.env.STELLAR_NETWORK ?? "testnet") as "testnet" | "mainnet",
    rpcUrl: process.env.SOROBAN_RPC_URL ?? "https://soroban-testnet.stellar.org",
    contractId: required("PULSAR_CONTRACT_ID"),
    secretKey: required("FEEDER_SECRET_KEY"),
    intervalSeconds: parseInt(process.env.SUBMISSION_INTERVAL ?? "60", 10),
    activeFeeds: (process.env.ACTIVE_FEEDS ?? "XLM_USD").split(",").map((f) => f.trim()),
  };
}

/** Return the Horizon URL for the current network */
export function horizonUrl(config: Config): string {
  return config.network === "mainnet"
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";
}
