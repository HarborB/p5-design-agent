Features — prompt-to-sketch, two-step workflow, live preview, editable code, annotation panel, knob/color-wheel rack, light Liquid Glass UI, persistence
Tech stack — pnpm monorepo, React+Vite+Tailwind, Monaco, p5.js (CDN), Express 5, OpenAI, Zod, Drizzle/PostgreSQL
Project structure — top-level layout and the frontend's src/ map
Getting started — prerequisites, install, the two env vars the API server needs (AI_INTEGRATIONS_OPENAI_BASE_URL, AI_INTEGRATIONS_OPENAI_API_KEY), and the run/build/typecheck commands
How it works — the full pipeline: input → JSON contract from the model → live let X = …; rewriting → sandboxed iframe → editable source on top
Design system — the Liquid Glass rules (lg-bg, lg-glass, lg-panel, lg-subsurface, lg-press, no glass-on-glass)
License footer — © 2026 Harbor Bai. All rights reserved.
