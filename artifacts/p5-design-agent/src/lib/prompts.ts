/**
 * Canonical system prompt for the p5.js Design Coding Agent.
 *
 * This is the single source of truth for the prompt that drives the agent.
 * The current implementation uses a deterministic mock in `mockAgent.ts`,
 * but every output produced by that mock is shaped to satisfy the OUTPUT
 * FORMAT defined here. When swapping in a real LLM, send this prompt as
 * the system message and parse the response sections back into the
 * `AssignmentAnalysis`, `VisualRules`, and scaffold string types defined
 * in `types.ts`.
 */

export const SYSTEM_PROMPT = `You are an assistant inside a computational design learning tool.

Your task is to help translate a design assignment and user intent into:
1) structured visual rules
2) an editable p5.js scaffold (NOT a complete solution)
3) a short explanation
4) an AI-use disclosure draft

IMPORTANT RULES:
- Do NOT generate a fully finished assignment
- The code must be a scaffold, not a final polished solution
- Include clear comments and TODOs in the code
- Keep everything interpretable and structured
- Do NOT skip steps or merge them`;

export const USER_PROMPT_TEMPLATE = `INPUT:

Assignment:
{{assignment_text}}

Attached Files:
{{attached_files}}

Design Intent:
{{design_intent}}

---

OUTPUT FORMAT (STRICT):

### Assignment Analysis
- Tasks:
- Requirements:
- Constraints:

### Visual Rules
- Visual Units:
- Parameters:
- Transformation Logic:
- Spatial Organization:
- Interaction Ideas:
- Shape Grammar Explanation:

### p5.js Scaffold
\`\`\`javascript
// Must include setup() and draw()
// Must be runnable in p5.js
// Must include comments and TODOs

// Example structure:
let rows = 20;
let cols = 20;

// TODO: adjust parameters

class Tile {
  constructor(x, y, size, offset) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.offset = offset;
  }

  display() {
    // TODO: implement drawing logic
  }
}

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(240);

  // TODO: loop over grid and render tiles
}
\`\`\`

### Short Explanation
A brief paragraph (3–5 sentences) explaining the visual concept and how the scaffold maps to the rules above.

### AI-Use Disclosure Draft
A short, honest statement the student can adapt, listing what the AI generated (analysis, rules, scaffold structure) and what remains for the student to author (parameter tuning, TODO resolution, aesthetic decisions, iteration).`;

/**
 * Fill the user prompt template with the student's inputs.
 *
 * For attached PDFs and images, this currently inserts a text manifest of the
 * filenames. When swapping in a real LLM, send each file's `dataUrl` as a
 * multimodal content part (e.g. Anthropic `image` block, OpenAI `image_url`
 * part, or Gemini `inlineData`) instead of stringifying the filenames here.
 * The session keeps `attachedFiles` in `AppState` so the same files are
 * available as memory for every later step (rules, scaffold, report).
 */
export function buildUserPrompt(
  assignmentText: string,
  designIntent: string,
  attachedFiles: { name: string; mimeType: string; size: number }[] = []
): string {
  const fileManifest =
    attachedFiles.length === 0
      ? "(none)"
      : attachedFiles
          .map((f) => `- ${f.name} (${f.mimeType}, ${(f.size / 1024).toFixed(1)} KB)`)
          .join("\n");
  return USER_PROMPT_TEMPLATE
    .replace("{{assignment_text}}", assignmentText.trim() || "(no assignment provided)")
    .replace("{{attached_files}}", fileManifest)
    .replace("{{design_intent}}", designIntent.trim() || "(no design intent provided)");
}
