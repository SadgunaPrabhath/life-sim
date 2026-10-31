# LIFE//SIM — An AI-Powered Life Simulation RPG

A polished, dark-futuristic life-simulation RPG. Start at 18, and build a career,
wealth, skills and relationships one month at a time. Every choice ripples forward.

![tech](https://img.shields.io/badge/React-18-06b6d4) ![tech](https://img.shields.io/badge/Vite-5-7c3aed) ![tech](https://img.shields.io/badge/TypeScript-5-3178c6) ![tech](https://img.shields.io/badge/Tailwind-3-38bdf8)

## Launch

```bash
cd life-sim
npm install      # already done
npm run dev      # → http://localhost:5173
```

Other scripts: `npm run build` (production bundle), `npm run preview` (serve the build), `npm run lint` (typecheck).

## What's inside

- **Cinematic character creation** — 7 personalities, each generating distinct starting stats.
- **Monthly simulation engine** — plan up to 3 focuses, then *Live Next Month* for an animated recap of income, expenses, market moves and stat changes.
- **9 career ladders** (Software / AI / Data / Security / Game Dev / Design / Creator / Researcher / Entrepreneur), each with 5 promotion tiers and skill-gated progression. Switch careers anytime.
- **RPG skill tree** — 20 skills across 7 categories, levels 1→100 with prerequisite chains.
- **50+ dynamic, context-aware life events** — the world reacts to your wealth, happiness, health, reputation and relationships.
- **Persistent NPC relationships** — trust, bond & compatibility that evolve (Acquaintance → Friend → Best Friend, Romantic → Partner, plus Mentors & Rivals).
- **Finance sim** — cash, debt, SIPs and 5 asset classes (savings/index/stocks/crypto/business) with monthly market simulation; start & scale a company.
- **33 achievements**, an auto-generated **life timeline**, and a weighted **Life Score** with category breakdown.
- **End of life** — cinematic summary + a personalized life story woven from your actual history.
- **Save system** — autosaves to `localStorage`; refresh-safe. Manual save + New Life.

## Architecture

Game logic is fully decoupled from the UI.

```
src/
  game/
    data/        careers, skills, actions, events, achievements, npcs, stats
    engine/      state, simulation, events, finance, skills, scoring, ai
  hooks/         GameContext (single source of truth)
  components/    ui/ · game/ · tabs/ · modals/
  pages/         StartMenu · CharacterCreation · Game · EndScreen
  types/         full GameState type model
  utils/         random (seeded PRNG) · format · storage
```

### LLM-ready by design (`src/game/engine/ai.ts`)

The event/decision/story systems sit behind provider interfaces
(`EventEngineProvider`, `DecisionEngineProvider`, `StoryEngineProvider`). V1 ships
deterministic **Local** providers that need **no API key**. To connect Claude (or any
LLM) later for dynamic events, NPC dialogue and life-story generation, implement the
same interfaces with `fetch()` calls and swap them via `setProviders({ ... })`.

## Tech

React · Vite · TypeScript · Tailwind CSS · Lucide React · Recharts.
