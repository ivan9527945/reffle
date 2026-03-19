# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (Vite)
npm run build      # Type-check (tsc -b) then build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

No test runner is configured.

## Architecture

BTC Raffle is a React + TypeScript app where users run verifiable raffles using Bitcoin block hashes as a randomness source. The winner is determined deterministically:

```
winner = participants[BigInt("0x" + blockHash) % BigInt(participantCount)]
```

**View routing** is state-machine style (no React Router) — `App.tsx` switches between three views based on `RaffleState.view`:

1. **SetupView** — configure title, participants, target block
2. **WaitingView** — polls Mempool.space API every 30s for block progress
3. **ResultView** — displays winner and an interactive step-by-step verifier

**State management** uses `useRaffle()` hook with `localStorage` (`btc-raffle-v2` key) — no Redux/Zustand. State persists across page refreshes automatically.

**Bitcoin API** (`src/lib/bitcoin.ts`) calls `https://mempool.space/api`:
- `GET /blocks/tip/height` — current block height
- `GET /block-height/{height}` — block hash for a specific height

**Key hooks:**
- `useRaffle` — central raffle state + localStorage persistence
- `useBitcoin` — `useCurrentHeight()` (polls tip) and `useBlockWatcher()` (watches target block)
- `useConfetti` — celebration animation (80 particles)
- `useToast` — closure-based notification system (no context)

**UI components** in `src/components/ui/` wrap Radix UI primitives. Button variants are managed with `class-variance-authority`. Styling is Tailwind CSS + SCSS globals (`src/styles/globals.scss`) with Bitcoin orange (`#f7931a`, CSS var `--btc`) as the primary accent.

## Conventions

- All user-facing text is in **Traditional Chinese (zh-TW)**
- Monospace font (JetBrains Mono) used for hashes and block numbers — apply `.mono` class or `font-mono`
- TypeScript strict mode; avoid `any`
- No test framework — verify changes manually via `npm run dev`
