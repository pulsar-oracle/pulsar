use soroban_sdk::{contracttype, Symbol};

/// A single data point submitted by a feeder node
#[contracttype]
pub struct Submission {
    pub feeder: soroban_sdk::Address,
    pub value: i128,
    pub timestamp: u64,
}

/// The aggregated feed value stored on-chain
#[contracttype]
pub struct DataFeed {
    pub feed_id: Symbol,
    pub value: i128,
    pub timestamp: u64,
    pub submissions: u32,
}
