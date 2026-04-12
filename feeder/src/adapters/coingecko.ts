import type { FeedAdapter } from "./index";

const COINGECKO_IDS: Record<string, string> = {
  XLM_USD: "stellar",
  BTC_USD: "bitcoin",
  ETH_USD: "ethereum",
};

/**
 * CoinGecko price feed adapter.
 * Uses the free CoinGecko API — no API key required for basic usage.
 */
export class CoinGeckoAdapter implements FeedAdapter {
  constructor(public feedId: string) {}

  async fetchValue(): Promise<bigint> {
    const coinId = COINGECKO_IDS[this.feedId];
    if (!coinId) throw new Error(`No CoinGecko mapping for feed: ${this.feedId}`);

    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`CoinGecko request failed: ${res.status}`);

    const data = (await res.json()) as Record<string, { usd: number }>;
    const price = data[coinId]?.usd;
    if (price == null) throw new Error(`No price returned for ${coinId}`);

    // Scale to 6 decimal places as integer
    return BigInt(Math.round(price * 1_000_000));
  }
}
