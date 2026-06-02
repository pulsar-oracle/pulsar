use soroban_sdk::{Env, Symbol, Vec};
use crate::types::{DataFeed, Submission};

/// Collect raw submissions and compute the median value
pub fn aggregate(env: &Env, submissions: &Vec<Submission>) -> i128 {
    if submissions.is_empty() {
        return 0;
    }
    let mut values: Vec<i128> = Vec::new(env);
    for s in submissions.iter() {
        let idx = match values.binary_search(s.value) {
            Ok(i) | Err(i) => i,
        };
        values.insert(idx, s.value);
    }
    let mid = values.len() / 2;
    if values.len().is_multiple_of(2) {
        (values.get_unchecked(mid - 1) + values.get_unchecked(mid)) / 2
    } else {
        values.get_unchecked(mid)
    }
}

/// Persist the aggregated feed result to storage
pub fn store_feed(env: &Env, feed_id: &Symbol, value: i128, submissions: u32) {
    let feed = DataFeed {
        feed_id: feed_id.clone(),
        value,
        timestamp: env.ledger().timestamp(),
        submissions,
    };
    env.storage().persistent().set(feed_id, &feed);
}

/// Read the latest aggregated value for a feed
pub fn read_feed(env: &Env, feed_id: &Symbol) -> Option<DataFeed> {
    env.storage().persistent().get(feed_id)
}

/// Validate that a submission timestamp is not too stale (within 5 minutes)
pub fn is_fresh(submission_ts: u64, current_ts: u64) -> bool {
    current_ts.saturating_sub(submission_ts) <= 300
}
