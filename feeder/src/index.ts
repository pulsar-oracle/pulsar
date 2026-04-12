import { loadConfig } from "./config";
import { CoinGeckoAdapter, BinanceAdapter } from "./adapters";
import type { FeedAdapter } from "./adapters";
import { submitFeedValue } from "./submitter";

async function runCycle(adapters: FeedAdapter[], config: ReturnType<typeof loadConfig>) {
  for (const adapter of adapters) {
    try {
      const value = await adapter.fetchValue();
      await submitFeedValue(config, adapter.feedId, value);
      console.log(`[${adapter.feedId}] ✓ submitted ${value}`);
    } catch (err) {
      console.error(`[${adapter.feedId}] ✗ error:`, (err as Error).message);
    }
  }
}

async function main() {
  const config = loadConfig();
  console.log(`Pulsar feeder starting on ${config.network}`);
  console.log(`Active feeds: ${config.activeFeeds.join(", ")}`);

  const adapters: FeedAdapter[] = config.activeFeeds.map(
    (feedId) => new CoinGeckoAdapter(feedId)
  );

  // Run immediately, then on interval
  await runCycle(adapters, config);
  setInterval(() => runCycle(adapters, config), config.intervalSeconds * 1000);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
