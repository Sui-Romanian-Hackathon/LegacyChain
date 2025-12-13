module SUI_dms_proj::inheritance {

    use sui::object::UID;
    use sui::transfer;
    use sui::tx_context::TxContext;
    use sui::clock::Clock;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use std::vector;

    /// Error codes
    const ENoHeirs: u64 = 0;
    const EHeirShareMismatch: u64 = 1;
    const EInvalidSharesSum: u64 = 2;
    const ENotClient: u64 = 3;
    const EWillExpired: u64 = 4;
    const EWillNotExpired: u64 = 5;
    const ENotHeir: u64 = 6;
    const EAlreadyClaimed: u64 = 7;
    const EInsufficientBalance: u64 = 8;
    const EHeirExists: u64 = 9;
    const EHeirNotFound: u64 = 10;

    /// Constant for basis points (shares sum to 10_000 for 100%)
    const BASIS_POINTS: u64 = 10000;

    /// The Will object, shared for multi-user access (client heartbeats, heirs claim).
    /// Holds the SUI balance, heirs with shares, and timing info.
    /// - Uses timestamps from Clock for heartbeat checks.
    /// - Shares are in basis points (e.g., 5000 = 50%).
    /// - Each heir can claim their share independently after expiration.
    public struct Will has key {
        id: UID,
        client: address,
        heirs: vector<address>,
        shares: vector<u64>, // Parallel to heirs, sum to BASIS_POINTS
        balance: Balance<SUI>,
        last_heartbeat_ms: u64,
        timeout_duration_ms: u64, // Time before entering grace period
        grace_duration_ms: u64,   // Additional time client can heartbeat
    }

    /// Create a new Will with deposited SUI, heirs, shares, and durations.
    /// - Validates heirs and shares match in length, shares sum to BASIS_POINTS, at least one heir.
    /// - Deposits the entire Coin<SUI> as the asset.
    /// - Sets initial heartbeat to current timestamp.
    /// - Shares the Will object for public access.
    /// Why shared: Allows client to heartbeat and heirs to claim without ownership transfer until claim.
    public entry fun create_will(
        deposit: Coin<SUI>,
        heirs: vector<address>,
        shares: vector<u64>,
        timeout_duration_ms: u64,
        grace_duration_ms: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!vector::is_empty(&heirs), ENoHeirs);
        assert!(vector::length(&heirs) == vector::length(&shares), EHeirShareMismatch);
        let mut sum = 0;
        let mut i = 0;
        while (i < vector::length(&shares)) {
            sum = sum + *vector::borrow(&shares, i);
            i = i + 1;
        };
        assert!(sum == BASIS_POINTS, EInvalidSharesSum);

        let will = Will {
            id: object::new(ctx),
            client: tx_context::sender(ctx),
            heirs,
            shares,
            balance: coin::into_balance(deposit),
            last_heartbeat_ms: clock::timestamp_ms(clock),
            timeout_duration_ms,
            grace_duration_ms,
        };
        transfer::share_object(will);
    }

    /// Client sends heartbeat to reset the timer.
    /// - Only callable by client.
    /// - Only if not fully expired (current < last + timeout + grace).
    /// - Updates last_heartbeat to current timestamp.
    public entry fun heartbeat(will: &mut Will, clock: &Clock, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(sender == will.client, ENotClient);
        let now = clock::timestamp_ms(clock);
        assert!(now < will.last_heartbeat_ms + will.timeout_duration_ms + will.grace_duration_ms, EWillExpired);
        will.last_heartbeat_ms = now;
    }

    /// Heir claims their share of the SUI after full expiration.
    /// - Only callable by an heir.
    /// - Only if fully expired (current > last + timeout + grace).
    /// - Computes share based on basis points, splits from balance, transfers as Coin<SUI>.
    /// - Removes the heir from lists after claim to prevent double-claim.
    public entry fun claim_share(will: &mut Will, clock: &Clock, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        let now = clock::timestamp_ms(clock);
        assert!(now > will.last_heartbeat_ms + will.timeout_duration_ms + will.grace_duration_ms, EWillNotExpired);

        let (is_heir, index) = vector::index_of(&will.heirs, &sender);
        assert!(is_heir, ENotHeir);

        let total_value = balance::value(&will.balance);
        let heir_share_bp = *vector::borrow(&will.shares, index);
        let heir_amount = (total_value * heir_share_bp) / BASIS_POINTS;
        assert!(heir_amount > 0, EInsufficientBalance);

        let heir_bal = balance::split(&mut will.balance, heir_amount);
        let heir_coin = coin::from_balance(heir_bal, ctx);
        transfer::public_transfer(heir_coin, sender);

        // Remove heir to prevent double-claim
        vector::remove(&mut will.heirs, index);
        vector::remove(&mut will.shares, index);
    }

    /// Client cancels the Will and retrieves the full balance.
    /// - Only callable by client.
    /// - Only if not fully expired.
    /// - Transfers full Coin<SUI> back to client.
    /// - Deletes the Will object.
    public entry fun cancel_will(will: Will, clock: &Clock, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(sender == will.client, ENotClient);
        let now = clock::timestamp_ms(clock);
        assert!(now <= will.last_heartbeat_ms + will.timeout_duration_ms + will.grace_duration_ms, EWillExpired);

        let Will {
            id,
            client: _,
            heirs: _,
            shares: _,
            balance,
            last_heartbeat_ms: _,
            timeout_duration_ms: _,
            grace_duration_ms: _,
        } = will;
        let coin = coin::from_balance(balance, ctx);
        transfer::public_transfer(coin, sender);
        object::delete(id);
    }

    /// Client updates the heirs and shares.
    /// - Only callable by client.
    /// - Only if not fully expired.
    /// - Validates new heirs and shares as in create.
    /// - Replaces the entire lists.
    public entry fun update_heirs(
        will: &mut Will,
        new_heirs: vector<address>,
        new_shares: vector<u64>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(sender == will.client, ENotClient);
        let now = clock::timestamp_ms(clock);
        assert!(now <= will.last_heartbeat_ms + will.timeout_duration_ms + will.grace_duration_ms, EWillExpired);

        assert!(!vector::is_empty(&new_heirs), ENoHeirs);
        assert!(vector::length(&new_heirs) == vector::length(&new_shares), EHeirShareMismatch);
        let mut sum = 0;
        let mut i = 0;
        while (i < vector::length(&new_shares)) {
            sum = sum + *vector::borrow(&new_shares, i);
            i = i + 1;
        };
        assert!(sum == BASIS_POINTS, EInvalidSharesSum);

        will.heirs = new_heirs;
        will.shares = new_shares;
    }

    /// Client adds a single heir with share (adjusts by replacing full lists, but for simplicity, we can add helper).
    /// But to keep gas efficient, better to use update_heirs for batch changes.
    /// If single add needed, implement by pulling current, appending, but requires validation.
    /// For now, omitted; use update_heirs.

}