# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### p5 Studio (`artifacts/p5-design-agent`)

A professional prompt-to-sketch design workstation. Translate a text prompt and/or reference image into a runnable, tunable p5.js composition powered by the OpenAI API.

**Tech stack:**
- React + Vite + TypeScript + Tailwind CSS
- Monaco Editor (`@monaco-editor/react`) for read-only code display
- p5.js live preview via injected iframe with CDN
- Backend: `@workspace/api-server` Express route that calls OpenAI (`gpt-5.4`) with `response_format: json_object`
- Path-based proxying: frontend `fetch('/api/p5/generate')` is routed by the platform to the api-server
- localStorage persistence for prompt, image, last result, and parameter values

**Two-step workflow:**
1. **Input** (`InputView`): textarea + optional image drop zone → POST `/api/p5/generate`
2. **Workstation** (`Workstation`): three-panel professional layout:
   - Left top: Monaco code panel (read-only, line-numbered)
   - Left bottom (right of code): Annotation panel — clickable section cards that highlight and scroll the code (NOT inline comments)
   - Right: Live p5.js preview (iframe) — auto-refreshes on parameter change
   - Bottom: Audio-style "Parameter Rack" with channel-strip sliders for numbers and color swatches for colors

**Key files:**
- `src/lib/types.ts` — `GenerationResult`, `Annotation`, `Parameter`, `AppState`
- `src/lib/api.ts` — `generateP5Sketch()` fetch wrapper
- `src/lib/codeRuntime.ts` — `applyParameterValues()` rewrites top-level `let` declarations in the AI-generated code so live preview reflects current control values
- `src/lib/storage.ts` — localStorage helpers
- `src/components/InputView.tsx` — Step 1
- `src/components/Workstation.tsx` — Step 2 layout shell
- `src/components/CodePanel.tsx`, `AnnotationPanel.tsx`, `ControlsPanel.tsx`, `PreviewFrame.tsx` — workstation panels

### API Server (`artifacts/api-server`)

- `POST /api/p5/generate` — `{ prompt, image? }` → `{ title, summary, code, annotations[], parameters[] }`. Uses OpenAI SDK directly with env vars `AI_INTEGRATIONS_OPENAI_BASE_URL` and `AI_INTEGRATIONS_OPENAI_API_KEY` (provisioned via Replit AI Integrations).
- The system prompt requires the model to put every tunable value as a top-level `let name = literal;` so the host can rewrite that single line in place.
