use soroban_sdk::{Env, Symbol, Vec};
use crate::types::{DataFeed, Submission};

/// Collect raw submissions and compute the median value
pub fn aggregate(submissions: &Vec<Submission>) -> i128 {
    if submissions.is_empty() {
        return 0;
    }
    let mut values: std::vec::Vec<i128> = submissions.iter().map(|s| s.value).collect();
    values.sort();
    let mid = values.len() / 2;
    if values.len() % 2 == 0 {
        (values[mid - 1] + values[mid]) / 2
    } else {
        values[mid]
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
