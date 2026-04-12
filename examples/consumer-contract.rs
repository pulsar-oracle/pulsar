// Example: consuming a Pulsar price feed inside your own Soroban contract

#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env};

/// Minimal interface matching the Pulsar oracle contract
mod pulsar {
    soroban_sdk::contractimport!(file = "../contracts/target/wasm32-unknown-unknown/release/pulsar_contracts.wasm");
}

#[contract]
pub struct MyDeFiContract;

#[contractimpl]
impl MyDeFiContract {
    /// Get the current XLM/USD price from Pulsar and use it in your logic
    pub fn get_xlm_price(env: Env, pulsar_contract: Address) -> i128 {
        let client = pulsar::Client::new(&env, &pulsar_contract);
        let feed = client.get(&symbol_short!("XLM_USD")).expect("feed not found");
        feed.value // scaled by 1_000_000 (e.g. 1_050_000 = $1.05)
    }
}
