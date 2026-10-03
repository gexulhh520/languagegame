# Language Game

Immersive English practice via a 2.5D restaurant ordering scenario.

## Stack

- Vite + React + TypeScript
- Pixi.js (scene), GSAP (animation), Lucide React (icons)

## Structure

See `docs/GDD_餐厅点餐与系统设计.md` for the three-layer UI and AI task state machine.

```
src/
  components/   # GameWorld / Dialogue / Interactive / Feedback
  services/     # aiService + mockAiService
  state/        # useGameStore + LocalStorage memory
  types/        # shared TypeScript contracts
```

## Develop

```bash
npm install
npm run dev
```

Default AI path in early milestones: `mockAiService` (no API tokens).
