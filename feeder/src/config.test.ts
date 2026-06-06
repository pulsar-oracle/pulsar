import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig, horizonUrl } from "./config";

const REQUIRED_ENV = {
  PULSAR_CONTRACT_ID: "CCONTRACT",
  FEEDER_SECRET_KEY: "SSECRET",
};

function withEnv(overrides: Record<string, string | undefined>, fn: () => void) {
  const original: Record<string, string | undefined> = {};
  for (const key of Object.keys(overrides)) {
    original[key] = process.env[key];
  }
  try {
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    fn();
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("loadConfig throws when a required var is missing", () => {
  withEnv({ PULSAR_CONTRACT_ID: undefined, FEEDER_SECRET_KEY: undefined }, () => {
    assert.throws(() => loadConfig(), /Missing required env var: PULSAR_CONTRACT_ID/);
  });
});

test("loadConfig defaults network to testnet", () => {
  withEnv({ ...REQUIRED_ENV, STELLAR_NETWORK: undefined }, () => {
    assert.equal(loadConfig().network, "testnet");
  });
});

test("loadConfig rejects an invalid STELLAR_NETWORK", () => {
  withEnv({ ...REQUIRED_ENV, STELLAR_NETWORK: "devnet" }, () => {
    assert.throws(() => loadConfig(), /Invalid STELLAR_NETWORK/);
  });
});

test("loadConfig rejects a non-numeric SUBMISSION_INTERVAL", () => {
  withEnv({ ...REQUIRED_ENV, SUBMISSION_INTERVAL: "soon" }, () => {
    assert.throws(() => loadConfig(), /Invalid SUBMISSION_INTERVAL/);
  });
});

test("loadConfig rejects a non-positive SUBMISSION_INTERVAL", () => {
  withEnv({ ...REQUIRED_ENV, SUBMISSION_INTERVAL: "0" }, () => {
    assert.throws(() => loadConfig(), /Invalid SUBMISSION_INTERVAL/);
  });
});

test("loadConfig splits and trims ACTIVE_FEEDS", () => {
  withEnv({ ...REQUIRED_ENV, ACTIVE_FEEDS: "XLM_USD, BTC_USD ,ETH_USD" }, () => {
    assert.deepEqual(loadConfig().activeFeeds, ["XLM_USD", "BTC_USD", "ETH_USD"]);
  });
});

test("horizonUrl picks mainnet vs testnet endpoint", () => {
  withEnv({ ...REQUIRED_ENV, STELLAR_NETWORK: "mainnet" }, () => {
    assert.equal(horizonUrl(loadConfig()), "https://horizon.stellar.org");
  });
  withEnv({ ...REQUIRED_ENV, STELLAR_NETWORK: "testnet" }, () => {
    assert.equal(horizonUrl(loadConfig()), "https://horizon-testnet.stellar.org");
  });
});
