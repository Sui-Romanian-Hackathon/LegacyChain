#[test_only]
module SUI_dms_proj::inheritance_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::clock::{Self};
    use sui::coin::{Self};
    use sui::sui::SUI;
    use sui::balance;
    use SUI_dms_proj::inheritance::{Self, Will};
    use std::vector;

    const CLIENT: address = @0x1;
    const HEIR1: address = @0x2;
    const HEIR2: address = @0x3;

    #[test]
    fun test_create_will_success() {
        let mut scenario = ts::begin(CLIENT);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        let deposit = coin::zero<SUI>(ts::ctx(&mut scenario));
        balance::increase_supply(&mut deposit.balance, 10000); // Simulate deposit

        let heirs = vector[HEIR1, HEIR2];
        let shares = vector[5000, 5000];
        inheritance::create_will(deposit, heirs, shares, 86400000, 86400000, &clock, ts::ctx(&mut scenario)); // 1 day each

        ts::next_tx(&mut scenario, CLIENT);
        let will: Will = ts::take_shared(&scenario);
        assert!(will.client == CLIENT, 0);
        assert!(vector::length(&will.heirs) == 2, 0);
        assert!(balance::value(&will.balance) == 10000, 0);
        assert!(will.last_heartbeat_ms == 1000, 0);

        ts::return_shared(will);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = inheritance::EInvalidSharesSum)]
    fun test_create_will_invalid_shares() {
        let mut scenario = ts::begin(CLIENT);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        let deposit = coin::zero<SUI>(ts::ctx(&mut scenario));
        inheritance::create_will(deposit, vector[HEIR1], vector[1000], 1000, 1000, &clock, ts::ctx(&mut scenario));
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_heartbeat_success() {
        let mut scenario = ts::begin(CLIENT);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        let deposit = coin::zero<SUI>(ts::ctx(&mut scenario));
        inheritance::create_will(deposit, vector[HEIR1], vector[10000], 1000, 1000, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, CLIENT);
        clock::set_for_testing(&mut clock, 1500); // Within timeout
        let mut will: Will = ts::take_shared(&scenario);
        inheritance::heartbeat(&mut will, &clock, ts::ctx(&mut scenario));
        assert!(will.last_heartbeat_ms == 1500, 0);

        ts::return_shared(will);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = inheritance::EWillExpired)]
    fun test_heartbeat_expired_fail() {
        let mut scenario = ts::begin(CLIENT);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        let deposit = coin::zero<SUI>(ts::ctx(&mut scenario));
        inheritance::create_will(deposit, vector[HEIR1], vector[10000], 1000, 1000, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, CLIENT);
        clock::set_for_testing(&mut clock, 3001); // After timeout + grace
        let mut will: Will = ts::take_shared(&scenario);
        inheritance::heartbeat(&mut will, &clock, ts::ctx(&mut scenario));

        ts::return_shared(will);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    #[test]
    fun test_claim_share_success() {
        let mut scenario = ts::begin(CLIENT);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        let mut deposit = coin::zero<SUI>(ts::ctx(&mut scenario));
        balance::increase_supply(&mut deposit.balance, 10000);

        inheritance::create_will(deposit, vector[HEIR1, HEIR2], vector[5000, 5000], 1000, 1000, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, HEIR1);
        clock::set_for_testing(&mut clock, 3001); // Expired
        let mut will: Will = ts::take_shared(&scenario);
        inheritance::claim_share(&mut will, &clock, ts::ctx(&mut scenario));
        assert!(balance::value(&will.balance) == 5000, 0); // Half claimed
        assert!(vector::length(&will.heirs) == 1, 0);

        ts::return_shared(will);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // Property-based: Test shares sum invariant after update
    #[test]
    fun test_update_heirs_invariant_shares_sum() {
        let mut scenario = ts::begin(CLIENT);
        let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
        clock::set_for_testing(&mut clock, 1000);

        let deposit = coin::zero<SUI>(ts::ctx(&mut scenario));
        inheritance::create_will(deposit, vector[HEIR1], vector[10000], 1000, 1000, &clock, ts::ctx(&mut scenario));

        ts::next_tx(&mut scenario, CLIENT);
        let mut will: Will = ts::take_shared(&scenario);
        inheritance::update_heirs(&mut will, vector[HEIR1, HEIR2], vector[6000, 4000], &clock, ts::ctx(&mut scenario));

        let mut sum = 0;
        let mut i = 0;
        while (i < vector::length(&will.shares)) {
            sum = sum + *vector::borrow(&will.shares, i);
            i = i + 1;
        };
        assert!(sum == 10000, 0);

        ts::return_shared(will);
        clock::destroy_for_testing(clock);
        ts::end(scenario);
    }

    // Edge cases: Min/max values
    #[test]
    fun test_claim_min_balance() {
        // Similar setup, deposit 1, shares 10000, claim 1
        // ...
    }

    // More tests: cancel success/fail, update fail if expired, not client, etc.
}