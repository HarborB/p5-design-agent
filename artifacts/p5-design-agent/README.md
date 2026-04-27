# p5.js Design Coding Agent

A transparent workflow assistant for design students that turns an assignment brief and design intent into visual rule breakdowns, editable p5.js scaffold code, live previews, and AI-use disclosure reports.

## What It Does

The app guides students through a five-step sequential workflow:

1. **Assignment Brief** — Paste your brief to extract tasks, requirements, constraints, and deliverables
2. **Design Intent** — Describe your visual goal in plain language
3. **Visual Rules** — Generate a structured rule system: visual units, parameters, transformation logic, shape grammar
4. **Code Studio** — Generate a commented p5.js scaffold, edit it in Monaco Editor, run a live preview, debug common errors
5. **AI-Use Report** — Review an action log and generate a full AI-use disclosure report for academic submission

## Why It Is Transparency-Oriented

- The AI generates **scaffolds with TODO markers**, not finished work. Students must complete the logic themselves.
- Every AI action is **logged with a timestamp and user input**, creating a full audit trail.
- A generated **AI-use disclosure report** documents what the AI did, what the student did, and estimates authorship split.
- No data leaves the browser — all state is stored in localStorage only.
- The tool frames itself explicitly as a learning aid, not an assignment-completion service.

## How to Run

```bash
pnpm --filter @workspace/p5-design-agent run dev
```

The app runs on the port assigned by the Replit environment.

## Future API Integration Plan

The mock agent functions in `src/lib/mockAgent.ts` are structured to be replaced by real LLM API calls:

- `analyzeAssignment(text)` — call an LLM with a structured prompt to parse assignment briefs
- `generateVisualRules(analysis, intent)` — call an LLM to produce visual rule systems from design intent
- `generateP5Scaffold(rules)` — call an LLM to generate runnable p5.js code from visual rules
- `debugCode(code)` — can be supplemented with a code-analysis LLM for richer feedback
- `generateAIUseReport(logs, code)` — call an LLM to write a more nuanced authorship narrative

To add real LLM calls:
1. Add an API key to environment secrets
2. Replace the mock return values in `mockAgent.ts` with `fetch()` calls to your LLM provider
3. Wrap calls in loading states (already implemented in each component)

## File Structure

```
src/
  app.tsx                  — Main app shell, state management, step routing
  components/
    ProgressBar.tsx        — Step indicator at the top
    AssignmentPanel.tsx    — Step 1: Brief input + analysis output
    IntentPanel.tsx        — Steps 2–3: Intent input + visual rules output
    CodeStudio.tsx         — Step 4: Monaco editor + preview + debug
    PreviewFrame.tsx       — p5.js iframe preview renderer
    ReportPanel.tsx        — Step 5: Action log + report generation
  lib/
    types.ts               — TypeScript interfaces for all data types
    mockAgent.ts           — Mock AI logic (structured for real API replacement)
    storage.ts             — localStorage persistence helpers
```
