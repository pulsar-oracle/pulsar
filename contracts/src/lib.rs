#![no_std]
use soroban_sdk::{contract, contractimpl, Address, Env, Symbol, Vec};

mod aggregator;
mod feeds;
mod types;

use types::{DataFeed, Submission};

#[contract]
pub struct PulsarOracle;

#[contractimpl]
impl PulsarOracle {
    /// Register a new feed (admin only)
    pub fn register_feed(env: Env, feed_id: Symbol) {
        feeds::register_feed(&env, feed_id);
    }

    /// Submit a data point for a feed (feeder nodes call this)
    pub fn submit(env: Env, feeder: Address, feed_id: Symbol, value: i128) {
        feeder.require_auth();
        assert!(
            feeds::is_registered(&env, &feed_id),
            "feed not registered"
        );
        let submission = Submission {
            feeder,
            value,
            timestamp: env.ledger().timestamp(),
        };
        let mut pending: Vec<Submission> = env
            .storage()
            .temporary()
            .get(&feed_id)
            .unwrap_or(Vec::new(&env));
        pending.push_back(submission);
        env.storage().temporary().set(&feed_id, &pending);

        // Aggregate once we have enough submissions
        if pending.len() >= 3 {
            let aggregated = aggregator::aggregate(&env, &pending);
            aggregator::store_feed(&env, &feed_id, aggregated, pending.len());
            env.storage().temporary().remove(&feed_id);
        }
    }

    /// Read the latest value for a feed
    pub fn get(env: Env, feed_id: Symbol) -> Option<DataFeed> {
        aggregator::read_feed(&env, &feed_id)
    }

    /// List all registered feed IDs
    pub fn list_feeds(env: Env) -> Vec<Symbol> {
        feeds::list_feeds(&env)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::symbol_short;
    use soroban_sdk::testutils::Address as _;
    use soroban_sdk::Env;

    #[test]
    fn test_register_and_submit() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register_contract(None, PulsarOracle);
        let client = PulsarOracleClient::new(&env, &contract_id);

        let feed_id = symbol_short!("XLM_USD");
        client.register_feed(&feed_id);

        let f1 = Address::generate(&env);
        let f2 = Address::generate(&env);
        let f3 = Address::generate(&env);

        client.submit(&f1, &feed_id, &1_050_000);
        client.submit(&f2, &feed_id, &1_060_000);
        client.submit(&f3, &feed_id, &1_040_000);

        let result = client.get(&feed_id).expect("feed should exist");
        assert_eq!(result.value, 1_050_000); // median
    }
}
