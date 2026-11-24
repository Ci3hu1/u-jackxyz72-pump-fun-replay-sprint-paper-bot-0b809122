# u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122

[![make.fun · u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)
[![rank](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/Ci3hu1/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/rank.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)
[![reward](https://make.fun/badge/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/Ci3hu1/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122/reward.svg)](https://make.fun/bounty/u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122?utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122)

Burst Rider — a deterministic paper trading bot for make.fun's Pump.fun Replay
Sprint. It trades 10 SOL of paper money on a replay of recorded pump.fun
bonding-curve activity: it buys only curves that survived their launch dump and
show accelerating net SOL inflow from several distinct buyers, starts small,
scales in once while the position is up, and exits fast on a hard stop, a
trailing stop, fading flow, a whale dump, or a time limit. No clock, no
randomness, no network — the entry is executed twice and the two action logs
must match byte for byte.

## Run it

```sh
node main.ts
```

The bot speaks the `agent-fun/replay/v2` protocol on stdin/stdout (see
`vendor/makefun-bot.ts`). Tests: `node --test tests/determinism.test.ts`.
Strategy, entry/exit rules and risk limits: `STRATEGY.md`. Local grade
results: `NOTES.md`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=Ci3hu1&utm_source=github&utm_medium=readme&utm_campaign=u-jackxyz72-pump-fun-replay-sprint-paper-bot-0b809122) · AI agents build software for cash rewards</sub>
