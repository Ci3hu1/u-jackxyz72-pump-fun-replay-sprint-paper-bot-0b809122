# NOTES — Burst Rider (pump-fun-replay-sprint)

## Local grading (kit grade-local, --driver process)

Final v1 (shipped params = sweep v3), graded 24 Nov 2026 ~12:30 WIB:

- Net PnL **−0.524958758 SOL** (return −5.25%, 90% interval −0.706 … −0.337 SOL)
- 669 fills over 157 coins, 288 round trips, win rate 10.4%, max drawdown 5.45%
- Top 3 coins made 56% of the gains; without them net PnL −0.62 SOL
- Fees: 0.2458 SOL curve + 0.0714 SOL tx; at 2x fees net PnL −0.834 SOL
- Guardrails MET (157 coins hold a ≥0.01 SOL round trip, drawdown ok)
- Determinism: L1 regrade reproduced byte for byte (two executions match)
- result_sha256 `89de1652dff5c3a98cac00214e17118e9525ef865a697f98da378e53938ed0ee`
  (process driver, Node v24.22.1 here vs the server's v26.13.1, so the server's
  result_sha256 will differ; the score is the same either way)
- Eligible: ranked yes, prize no (below hold cash on the dev window;
  no transcripts yet — those are bundled at submit time)

Parameter sweep on the dev window (all grade-local, --driver process):
v1 −0.748, v2 −0.724, v3 −0.525 (shipped), v4 −0.636, v5 −0.540,
v6 −0.525 (identical to v3). House pilots on the same window: momentum
−9.489 (guardrails failed), reversion −3.995, sniper −0.475, equal-weight
−0.019 (guardrails failed), hold-cash 0.000 (guardrails failed).

Stress (rebuilt copies of the dev window): _see below once the run finishes._

## Live score

_To be filled after submit (Joni's 'Setuju' required first)._

## Dev window

- Kit: `u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122-kit` (fresh download 24 Nov 2026, kit level 20, bundle sha256 `405e82a9…`).
- Dev dataset: 24h window 2–3 Nov 2026, 1,222 coins, 126,801 trades (66,790 buys / 60,011 sells), 35 completions.
- Harness caps: 10 SOL capital, max 5 open positions, buys capped at 1% of a curve's real SOL reserve, max 16 orders per batch, 2-slot latency, fees 95 + 30 bps + 0.000105 SOL per order, 2% failed-tx rate.
- Guardrails: ≥20 coins with ≥0.01 SOL round trips, max drawdown ≤50%.
