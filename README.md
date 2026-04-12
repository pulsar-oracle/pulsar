# Pulsar

> Decentralized oracle network for Soroban smart contracts on Stellar.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Built for Stellar](https://img.shields.io/badge/Built%20for-Stellar-black)](https://stellar.org)

Pulsar is an open-source, decentralized oracle protocol purpose-built for the Soroban smart contract platform on Stellar. It enables Soroban contracts to securely consume real-world data — price feeds, event outcomes, weather data, sports results, and any off-chain information — in a trustless and permissionless way.

Without an oracle network, smart contracts on Soroban are isolated from the outside world. DeFi protocols can't price assets, insurance contracts can't respond to events, and prediction markets can't settle outcomes. Pulsar solves this.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Running a Feeder Node](#running-a-feeder-node)
- [Supported Data Feeds](#supported-data-feeds)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## How It Works

Pulsar operates in two layers:

1. **Off-chain feeder nodes** — Independent operators run feeder nodes that fetch data from external sources (CEXs, APIs, etc.), sign it with their private key, and submit it to the Pulsar aggregator contract on Stellar.

2. **On-chain aggregator contract** — A Soroban smart contract receives submissions from multiple feeders, applies an aggregation function (median by default), and stores the result. Any Soroban contract can then read from Pulsar with a single cross-contract call.

This design ensures no single entity controls the data, and any manipulation requires compromising a majority of registered feeder nodes.

---

## Features

- **Decentralized** — Multiple independent feeder nodes aggregate data; no single point of failure or control
- **Soroban-native** — Contracts are written in Rust using the Soroban SDK; zero external dependencies at the contract level
- **Permissionless reads** — Any Soroban contract can consume Pulsar data feeds without whitelisting
- **Extensible feed adapters** — Add new data sources by implementing the `FeedAdapter` interface in the feeder node
- **Slashing-ready architecture** — Feeder stake and slashing logic designed in from day one (implementation in roadmap)
- **Testnet & Mainnet support** — Works on Stellar Testnet and Mainnet

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Off-Chain Layer                   │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Feeder 1 │  │ Feeder 2 │  │ Feeder N │          │
│  │  Node    │  │  Node    │  │  Node    │          │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘          │
│       │             │             │                 │
└───────┼─────────────┼─────────────┼─────────────────┘
        │             │             │
        ▼             ▼             ▼
┌─────────────────────────────────────────────────────┐
│                  Stellar Network                    │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │         Pulsar Aggregator Contract           │   │
│  │  - Collects submissions from feeders         │   │
│  │  - Computes median                           │   │
│  │  - Stores latest value + timestamp           │   │
│  └──────────────────────┬───────────────────────┘   │
│                         │                           │
│              ┌──────────▼──────────┐                │
│              │  Consumer Contracts │                │
│              │  (DeFi, Insurance,  │                │
│              │   Prediction, etc.) │                │
│              └─────────────────────┘                │
└─────────────────────────────────────────────────────┘
```

---

## Project Structure

```
pulsar/
├── contracts/              # Soroban smart contracts (Rust)
│   ├── Cargo.toml
│   └── src/
│       └── lib.rs          # Aggregator contract
├── feeder/                 # Off-chain feeder node (TypeScript)
│   ├── package.json
│   └── src/
│       ├── index.ts        # Entry point
│       ├── adapters/       # Data source adapters (price APIs, etc.)
│       └── submitter.ts    # Stellar transaction builder & submitter
├── CONTRIBUTING.md
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (stable) with `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/stellar-cli)
- Node.js 20+
- A Stellar account with XLM (for contract deployment)

```bash
# Add Wasm target
rustup target add wasm32-unknown-unknown
```

### Install

```bash
git clone https://github.com/your-org/pulsar.git
cd pulsar

# Build contracts
cd contracts && cargo build --target wasm32-unknown-unknown --release

# Install feeder dependencies
cd ../feeder && npm install
```

### Deploy the Aggregator Contract (Testnet)

```bash
stellar contract deploy \
  --wasm contracts/target/wasm32-unknown-unknown/release/pulsar_contracts.wasm \
  --network testnet \
  --source YOUR_SECRET_KEY
```

---

## Usage

### Reading a Feed in Your Soroban Contract

```rust
use soroban_sdk::{contract, contractimpl, Address, Env};

#[contractimpl]
impl YourContract {
    pub fn get_xlm_price(env: Env, pulsar_contract: Address) -> i128 {
        let feed_id = symbol_short!("XLM_USD");
        let client = pulsar_contracts::Client::new(&env, &pulsar_contract);
        let feed = client.get(&feed_id).expect("feed not found");
        feed.value
    }
}
```

### Configuring a Feeder Node

```bash
cp feeder/.env.example feeder/.env
# Edit .env with your Stellar secret key and RPC endpoint
npm run start
```

---

## Running a Feeder Node

Anyone can run a feeder node and contribute data to Pulsar. The more operators, the more decentralized and reliable the network.

1. Clone the repo and install feeder dependencies
2. Configure your `.env` with a funded Stellar keypair
3. Choose which feeds to serve (see `feeder/src/adapters/`)
4. Start the node: `npm run start`

Feeder nodes submit data every 60 seconds by default (configurable).

---

## Supported Data Feeds

| Feed ID | Description | Source |
|---------|-------------|--------|
| `XLM_USD` | XLM/USD spot price | Aggregated from CEXs |
| `BTC_USD` | BTC/USD spot price | Aggregated from CEXs |
| `ETH_USD` | ETH/USD spot price | Aggregated from CEXs |

New feeds can be added by implementing a `FeedAdapter` — see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Roadmap

- [ ] Aggregator contract v1 (median aggregation)
- [ ] Feeder node with CEX price adapters
- [ ] Feeder registration & staking contract
- [ ] Slashing for malicious/stale data submissions
- [ ] Web dashboard for feed monitoring
- [ ] Additional feed types (sports, weather, random numbers)
- [ ] Mainnet deployment

---

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](./CONTRIBUTING.md) for how to get started, coding standards, and areas that need help.

## License

MIT — see [LICENSE](./LICENSE).
