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

### p5.js Design Coding Agent (`artifacts/p5-design-agent`)

A single-page React + Vite + TypeScript web app serving as a transparent workflow assistant for design students.

**Tech stack:**
- React + Vite + TypeScript + Tailwind CSS
- Monaco Editor (`@monaco-editor/react`) for code editing
- p5.js preview via injected iframe with CDN
- No backend — all state in React + localStorage

**Features:**
- 5-step sequential workflow with progress bar
- Step 1: Assignment brief analysis (tasks/requirements/constraints/deliverables)
- Step 2–3: Design intent → visual rule system (units, parameters, transformation logic, shape grammar)
- Step 4: Code Studio — Monaco editor + live p5.js iframe preview + rule-based debugger
- Step 5: AI-use disclosure report with action log, authorship estimate, copy/download
- Intelligent mock agent with moiré/triangle/Bridget Riley keyword detection
- Full localStorage persistence of all session state
- Sample brief and sample intent buttons for quick demo
- README at `artifacts/p5-design-agent/README.md`

**Key files:**
- `src/lib/types.ts` — TypeScript interfaces
- `src/lib/mockAgent.ts` — mock AI logic (structured for real API replacement)
- `src/lib/storage.ts` — localStorage helpers
- `src/components/AssignmentPanel.tsx` — Step 1
- `src/components/IntentPanel.tsx` — Steps 2–3
- `src/components/CodeStudio.tsx` — Step 4 (Monaco + preview + debug)
- `src/components/PreviewFrame.tsx` — p5.js iframe sandbox
- `src/components/ReportPanel.tsx` — Step 5
- `src/components/ProgressBar.tsx` — workflow progress indicator
