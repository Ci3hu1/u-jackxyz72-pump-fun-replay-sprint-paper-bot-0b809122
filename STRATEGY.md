# STRATEGY.md — Burst Rider

## Edge

Most new pump.fun curves die within minutes of launch; a small minority catch a
real burst of distinct buyers and run multiples. The edge is selectivity + fast
exits: buy only a curve that has already survived its launch dump (≥300 slots
old) and shows accelerating net SOL inflow from several distinct wallets with
the price rising and sitting near its recent high; start with 0.03 SOL, scale in
once only while the position is already up; bank winners at +50% and cut every
loser at −20%, trailing winners at −20% from peak once up 8%. Fees are ~1.25%
of size each way plus 0.000105 SOL per order, so a round trip costs ~5% of a
0.03 SOL stake — the entry filter has to clear that bar, which is why the
signal demands ≥3% price rise with net inflow ≥0.3 SOL from ≥4 distinct buyers
in 24 slots.

## Entry rules

On each batch, for each curve that traded, buy when ALL hold:

- real SOL reserves between 1 and 40 SOL (liquid enough to matter, small enough
  to still run);
- age ≥ 300 slots since CreateEvent (fresh curves are mostly bundled launches);
- over the last 24 slots: net inflow ≥ 0.3 SOL, ≥ 4 buy trades, ≥ 4 distinct
  buying wallets;
- price up 3%–60% over the window, sitting within 5% of the window high;
- inflow accelerating: the newer half of the window brought in at least as much
  net SOL as the older half;
- no single wallet supplied more than 90% of the window's buy SOL;
- at most 2 entries per curve, 120-slot cooldown after an exit.

First buy 0.03 SOL (capped at 1% of the curve's real SOL reserve — the harness
cap — and by free cash). One scale-in of 0.03 SOL only while the position is up
≥5%, the price stepped up ≥3% from the last buy, and net flow over the entry
window is still ≥0.2 SOL. Total stake per coin ≤ 0.12 SOL.

## Exit rules

A position is sold whole on the first of:

- take-profit: close value ≥ cost × 1.50;
- hard stop: close value < cost × 0.80;
- trailing stop: once the close value reached cost × 1.08, exit when it falls
  20% below its peak close value;
- fading flow: net SOL over the last 12 slots < −0.3 SOL;
- whale dump: any single recorded sell ≥ 3 SOL on the curve;
- time limit: held > 600 slots while up less than 100%.

Buys use 1500 bps max slippage (the 2-slot latency moves prices); sells use
10000 bps — when the bot wants out, it wants out. A curve that completes is
closed by the replay itself; the bot never orders on a completed curve.

## Risk limits

- At most 4 main positions + 1 probe (harness cap: 5 open positions).
- Total exposure at cost ≤ 5 SOL of the 10 SOL capital; never all-in, no
  martingale, no leverage, no shorts (the harness allows none anyway).
- Guardrail pacing: the run must end with a ≥0.01 SOL round trip on ≥20 coins.
  When the bot's own fills or coins lag the pace (25 coins / 200 fills scaled
  by elapsed block time over 4h), it opens tiny 0.01 SOL probe round trips on
  liquid curves until back on pace. A probe costs ~5% of 0.01 SOL in fees —
  cheap insurance for the minimum bar.
- Maximum drawdown guardrail is 50%; the 5 SOL exposure cap plus −20% stops
  keep the realised drawdown far below it (5.5% on the dev window).

## Determinism

No clock, no environment, no Math.random. All iteration is over
insertion-ordered maps fed by the batch stream; all arithmetic is plain
IEEE-754 doubles computed identically on every run. The bot needs no seed.
Verified by `tests/determinism.test.ts` (two runs, byte-identical replies) and
by the kit's grade-local, which executes the entry twice and requires the two
action logs to match byte for byte.

## Tried and dropped

- Buying fresh curves on their CreateEvent batch (the equal-weight baseline
  shape): too many bundled launches dump immediately; the 300-slot maturity
  filter exists because of this.
- Pyramiding repeatedly into strength: adds made after the first scale-in
  mostly bought the top of the burst; one scale-in only.
- A tighter 10% stop: stopped out by the 2-slot latency noise before the burst
  could develop; 20% survives the noise and still cuts real losers.
- Holding to completion ("ride" behaviour): most curves that complete do so
  after giving the gains back; the trailing stop banks the run instead.
- Larger stakes (0.05 first buy / 0.25 total, v1): −0.748 SOL on the dev
  window — the fee drag per round trip is the same share, but losers cost more
  per coin; small stakes with a fast take-profit won the sweep.

## Parameter sweep (grade-local, dev window, 24 Nov 2026)

| variant | change vs v1 | net PnL (SOL) | coins | round trips | win rate | max DD |
|---|---|---|---|---|---|---|
| v1 | as first built | −0.748 | 152 | 283 | 12.4% | 7.8% |
| v2 | stop 15%, trail 20%, TP +60%, stricter entry | −0.724 | 143 | 261 | 10.3% | 7.4% |
| v3 (shipped) | stake 0.03/0.12, TP +50%, stop 20% | −0.525 | 157 | 288 | 10.4% | 5.5% |
| v4 | strict entry (≥10% rise, ≥6 buyers, ≥1 SOL net) + TP +80% | −0.636 | 134 | 243 | 11.1% | 6.4% |
| v5 | v3 + stop 15%, TP +40%, looser entry | −0.540 | 156 | 293 | 12.3% | 5.6% |
| v6 | v3 + 300-slot hold cap | −0.525 | 157 | 288 | 10.4% | 5.5% |

For reference on the same window, the house pilots scored: momentum −9.489
(drawdown 95.7%, guardrails failed), reversion −3.995, sniper −0.475,
equal-weight −0.019 (guardrails failed, 5 fills), hold-cash 0.000 (guardrails
failed). No strategy is profitable on this dev window; v3 is the least-bad of
ours and beats two of the three pilots while meeting every guardrail.

## Expected outcomes

On the dev window (1,222 coins, ~127k trades, 24h) the bot clears the minimum
bar (157 coins with ≥0.01 SOL round trips, drawdown 5.5%) but finishes at
−0.525 SOL net PnL — below holding cash, so it would not take a paid place on
this window. The final window is recorded after entries close, so no
dev-window number is a forecast: the final 24h of coins is a different draw,
and a strategy that loses least on a brutal dev window is the best available
bet. The stress band from `grade-local --stress` is the honest spread. A dev
score concentrated in the top 3 coins (56% of gains here), or a stress median
far below the dev score, means the result leans on this window's particular
coins.
