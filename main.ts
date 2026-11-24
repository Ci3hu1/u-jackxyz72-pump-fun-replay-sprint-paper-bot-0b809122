// Burst Rider — deterministic paper bot for the pump.fun replay sprint.
// Entrypoint: the grader runs `node /bot/main.ts` (Node 22 strips the types;
// no build step, no install, no network). The shim in vendor/ owns the wire:
// it reads hello / batch / done lines from stdin and writes exactly one reply
// per batch to stdout. All trading logic lives in strategy.ts.

import { runBot } from './vendor/makefun-bot.ts';
import { createStrategy } from './strategy.ts';

await runBot(createStrategy());
