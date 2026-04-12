// Feed adapter interface — implement this to add new data sources

export interface FeedAdapter {
  /** The feed ID this adapter serves, e.g. "XLM_USD" */
  feedId: string;
  /** Fetch the latest value. Returns an integer (scaled by 1_000_000 for 6 decimal places) */
  fetchValue(): Promise<bigint>;
}

export { CoinGeckoAdapter } from "./coingecko";
export { BinanceAdapter } from "./binance";
