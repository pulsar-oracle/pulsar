import type { FeedAdapter } from "./index";

const BINANCE_SYMBOLS: Record<string, string> = {
  XLM_USD: "XLMUSDT",
  BTC_USD: "BTCUSDT",
  ETH_USD: "ETHUSDT",
};

/**
 * Binance spot price feed adapter.
 * Uses the public Binance REST API ticker endpoint.
 */
export class BinanceAdapter implements FeedAdapter {
  constructor(public feedId: string) {}

  async fetchValue(): Promise<bigint> {
    const symbol = BINANCE_SYMBOLS[this.feedId];
    if (!symbol) throw new Error(`No Binance symbol mapping for feed: ${this.feedId}`);

    const url = `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Binance request failed: ${res.status}`);

    const data = (await res.json()) as { price: string };
    const price = parseFloat(data.price);
    if (isNaN(price)) throw new Error(`Invalid price from Binance for ${symbol}`);

    // Scale to 6 decimal places as integer
    return BigInt(Math.round(price * 1_000_000));
  }
}
