use soroban_sdk::{Address, Env, Symbol};

const ADMIN_KEY: &str = "ADMIN";

/// Set the contract admin. Can only be called once.
pub fn initialize(env: &Env, admin: Address) {
    let key = Symbol::new(env, ADMIN_KEY);
    assert!(!env.storage().instance().has(&key), "already initialized");
    env.storage().instance().set(&key, &admin);
}

/// Require that the caller is the configured admin.
pub fn require_admin(env: &Env) {
    let key = Symbol::new(env, ADMIN_KEY);
    let admin: Address = env
        .storage()
        .instance()
        .get(&key)
        .expect("contract not initialized");
    admin.require_auth();
}
