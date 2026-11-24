// Determinism + protocol tests for the Burst Rider strategy.
//
// Run: node --test tests/   (Node 22.18+ strips the types; no build step)
// The determinism test drives the strategy twice over the same synthetic
// hello / batch stream and requires the two reply streams to match byte for
// byte — the same property the grader checks when it executes the entry twice.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BotState, type Batch, type Hello } from '../vendor/makefun-bot.ts';
import { createStrategy, DEFAULT_PARAMS } from '../strategy.ts';

const MINT_A = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
const MINT_B = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const CREATOR = '7xKXtt2Khs6ShQha5xT8FvM9vJ3hP4qL2mN8wR5tY7uI';

function hello(): Hello {
  return {
    type: 'hello',
    protocol: 'agent-fun/replay/v2',
    seed: '12345',
    universe: {
      program: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P',
      quote: 'SOL',
      mayhem: 'excluded',
      exclude_cashback: true,
      sample: { hash: 'sha256', modulus: 16, residue: 15 },
    },
    capital: { lamports: '10000000000' },
    caps: {
      max_open_positions: 5,
      max_order_bps_of_real_reserve: 100,
      max_orders_per_batch: 16,
      shorts: false,
      leverage: false,
    },
    latency_slots: 2,
    fees: {
      protocol_bps_fallback: 95,
      creator_bps_fallback: 30,
      base_fee_lamports: '5000',
      priority_fee_lamports: '100000',
      failed_tx_bps: 200,
    },
  };
}

function createEvent(mint: string, slot: number, time: number): any {
  return {
    event: 'CreateEvent',
    slot,
    signature: `sig-create-${slot}`,
    block_time: time,
    chain_seq: 0,
    name: 'Test',
    symbol: 'TEST',
    uri: 'https://example.invalid/t.json',
    mint,
    bonding_curve: 'BondingCurve111111111111111111111111111111',
    user: CREATOR,
    creator: CREATOR,
    timestamp: String(time),
    virtual_token_reserves: '1000000000000000',
    virtual_sol_reserves: '30000000000',
    real_token_reserves: '800000000000000',
    token_total_supply: '1000000000000000',
    token_program: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
    is_mayhem_mode: false,
    is_cashback_enabled: false,
    quote_mint: 'So11111111111111111111111111111111111111112',
    virtual_quote_reserves: '30000000000',
    creator_fee_bps: 0,
    is_holder_reward: false,
    depth: 0,
  };
}

// A trade that pushes the price up: virtual quote reserves rise, so the
// price (virtual_quote / virtual_token) rises with it.
function tradeEvent(mint: string, slot: number, time: number, seq: number, buy: boolean, solLamports: string, vq: string, vt: string): any {
  return {
    event: 'TradeEvent',
    slot,
    signature: `sig-trade-${slot}-${seq}`,
    block_time: time,
    chain_seq: seq,
    mint,
    sol_amount: solLamports,
    token_amount: '1000000000',
    is_buy: buy,
    user: `user${seq % 6}111111111111111111111111111111111`,
    timestamp: String(time),
    virtual_sol_reserves: vq,
    virtual_token_reserves: vt,
    real_sol_reserves: '2000000000',
    real_token_reserves: '700000000000000',
    fee_recipient: CREATOR,
    fee_basis_points: '95',
    fee: '1000',
    creator: CREATOR,
    creator_fee_basis_points: '30',
    creator_fee: '300',
    track_volume: true,
    total_unclaimed_tokens: '0',
    total_claimed_tokens: '0',
    current_sol_volume: '1000000000',
    last_update_timestamp: String(time),
    ix_name: 'buy',
    mayhem_mode: false,
    cashback_fee_basis_points: '0',
    cashback: '0',
    buyback_fee_basis_points: '0',
    buyback: '0',
    shareholders: [],
    quote_mint: 'So11111111111111111111111111111111111111112',
    quote_amount: solLamports,
    virtual_quote_reserves: vq,
    real_quote_reserves: '2000000000',
    holder_rewards_bps: '0',
    holder_rewards: '0',
    creator_fee_unclaimed: '0',
  };
}

function batch(seq: number, slot: number, time: number, events: any[]): Batch {
  return { type: 'batch', seq, slot, events, marks: [], fills: [], account: { cash_lamports: '10000000000', positions: [] } };
}

/** Drive one strategy over a synthetic burst: create + 6 rising buys on mint A. */
function drive(): string[] {
  const bot = createStrategy();
  const state = new BotState(hello());
  const replies: string[] = [];
  const batches: Batch[] = [];
  batches.push(batch(0, 1000, 1_700_000_000, [createEvent(MINT_A, 1000, 1_700_000_000)]));
  // Six buys over 12 slots, price climbing ~1% a trade, distinct buyers.
  let vq = 30_000_000_000;
  for (let i = 0; i < 6; i++) {
    vq += 300_000_000;
    batches.push(
      batch(1 + i, 1300 + i * 2, 1_700_000_000 + i, [
        tradeEvent(MINT_A, 1300 + i * 2, 1_700_000_000 + i, i, true, '500000000', String(vq), '999000000000000'),
      ]),
    );
  }
  // A second coin appears and bursts too.
  batches.push(batch(7, 1320, 1_700_000_020, [createEvent(MINT_B, 1320, 1_700_000_020)]));
  for (let i = 0; i < 6; i++) {
    vq += 300_000_000;
    batches.push(
      batch(8 + i, 1620 + i * 2, 1_700_000_020 + i, [
        tradeEvent(MINT_B, 1620 + i * 2, 1_700_000_020 + i, i, true, '500000000', String(vq), '999000000000000'),
      ]),
    );
  }
  for (const b of batches) {
    state.applyBatch(b);
    const orders = state.toOrders(bot.onBatch!(state, b));
    replies.push(JSON.stringify({ seq: b.seq, orders }));
    state.recordOrders(orders);
  }
  return replies;
}

test('determinism: two runs over the same batches give byte-identical replies', () => {
  const first = drive();
  const second = drive();
  assert.equal(first.length, second.length);
  assert.equal(first.length, 14);
  for (let i = 0; i < first.length; i++) {
    assert.equal(first[i], second[i], `reply ${i} differs between runs`);
  }
});

test('entry: a qualifying burst produces a buy within the size cap', () => {
  const replies = drive().map((r) => JSON.parse(r));
  const buys = replies.flatMap((r: any) => r.orders.filter((o: any) => o.side === 'buy'));
  assert.ok(buys.length >= 1, 'expected at least one buy order');
  for (const buy of buys) {
    // 1% of the 2 SOL real reserve = 0.02 SOL cap; buys must respect it.
    assert.ok(BigInt(buy.quote_lamports) <= 20_000_000n, `buy ${buy.quote_lamports} over the 1% cap`);
    assert.ok(BigInt(buy.quote_lamports) >= 10_000_000n, 'buy below the 0.01 SOL minimum');
    assert.ok(buy.max_slippage_bps >= 0 && buy.max_slippage_bps <= 10_000);
  }
});

test('caps: no reply exceeds max_orders_per_batch and client_ids are unique', () => {
  const replies = drive().map((r) => JSON.parse(r));
  const seen = new Set<string>();
  for (const r of replies) {
    assert.ok(r.orders.length <= 16, 'reply over max_orders_per_batch');
    for (const o of r.orders) {
      assert.ok(!seen.has(o.client_id), `duplicate client_id ${o.client_id}`);
      seen.add(o.client_id);
      assert.ok(!o.client_id.startsWith('_'), 'client_id must not start with _');
    }
  }
});

test('no trade before maturity: a fresh curve gets no buy', () => {
  const bot = createStrategy();
  const state = new BotState(hello());
  const b0 = batch(0, 1000, 1_700_000_000, [createEvent(MINT_A, 1000, 1_700_000_000)]);
  state.applyBatch(b0);
  const orders = state.toOrders(bot.onBatch!(state, b0));
  assert.equal(orders.length, 0, 'fresh curve must not be bought on its create batch');
  void DEFAULT_PARAMS;
});
