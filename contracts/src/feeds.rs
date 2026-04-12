use soroban_sdk::{Env, Symbol, Vec};
use crate::types::DataFeed;

const FEEDS_KEY: &str = "FEEDS";

/// Register a new feed ID in the feed registry
pub fn register_feed(env: &Env, feed_id: Symbol) {
    let mut feeds: Vec<Symbol> = env
        .storage()
        .instance()
        .get(&Symbol::new(env, FEEDS_KEY))
        .unwrap_or(Vec::new(env));
    if !feeds.contains(&feed_id) {
        feeds.push_back(feed_id);
        env.storage()
            .instance()
            .set(&Symbol::new(env, FEEDS_KEY), &feeds);
    }
}

/// Return all registered feed IDs
pub fn list_feeds(env: &Env) -> Vec<Symbol> {
    env.storage()
        .instance()
        .get(&Symbol::new(env, FEEDS_KEY))
        .unwrap_or(Vec::new(env))
}

/// Check whether a feed ID is registered
pub fn is_registered(env: &Env, feed_id: &Symbol) -> bool {
    list_feeds(env).contains(feed_id)
}
