import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { logger } from "../lib/logger";

const router: IRouter = Router();

const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"];
const apiKey = process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];

if (!baseURL || !apiKey) {
  logger.warn(
    "AI_INTEGRATIONS_OPENAI_BASE_URL or AI_INTEGRATIONS_OPENAI_API_KEY is missing — /api/p5/generate will return 503.",
  );
}

const client =
  baseURL && apiKey ? new OpenAI({ baseURL, apiKey }) : null;

const SYSTEM_PROMPT = `You are a senior creative coder and design system architect. Your job is to translate a designer's prompt (text and optionally an image) into a runnable p5.js sketch, plus a set of structured annotations and tweakable parameters.

Respond with a single JSON object matching this exact schema:

{
  "title": string,                 // short, descriptive title (3-6 words)
  "summary": string,               // 1-2 sentence summary of the visual concept
  "code": string,                  // complete, runnable p5.js sketch (no <script>, no HTML)
  "annotations": [                 // explanations of code SECTIONS (NOT inline comments)
    {
      "title": string,             // e.g. "Parameter Setup", "Tile Class", "Draw Loop"
      "description": string,       // 1-3 sentences explaining what this section does
      "lineStart": integer,        // 1-based starting line in code
      "lineEnd": integer           // 1-based inclusive ending line in code
    }
  ],
  "parameters": [                  // tweakable controls (3-8 items)
    {
      "name": string,              // EXACT identifier of a top-level 'let' variable in the code
      "label": string,             // human label for the UI knob
      "type": "number" | "color",
      "min": number,               // required for number; ignored for color
      "max": number,               // required for number; ignored for color
      "step": number,              // required for number; ignored for color
      "default": number | string,  // initial value (number for number, hex string for color)
      "description": string        // 1 sentence explanation of what this controls
    }
  ]
}

CRITICAL RULES:
- The code MUST be runnable p5.js with both setup() and draw() functions and a createCanvas() call.
- The code MUST keep inline comments to a minimum — explanations live in 'annotations', not in the code.
- Every parameter you list MUST correspond to a top-level 'let <name> = <default>;' declaration on its own line near the top of the code. Use a literal value (number or quoted hex string), not an expression. This is so the host app can rewrite that single line at runtime to apply the user's slider value.
- Number parameters must declare numeric defaults; color parameters must declare a quoted hex string default like 'let bgColor = "#101010";'.
- Annotations must collectively cover all meaningful parts of the code. Use 3-7 annotation sections.
- Do NOT use external libraries other than p5.js core.
- Do NOT use createGraphics for sliders or DOM controls — the host app provides the controls.
- Use a default 600x600 canvas unless the prompt suggests otherwise.

Output ONLY the JSON object, no markdown fence, no prose.`;

type Validated<T> = { value: T } | { error: string };

interface GenerationShape {
  title: string;
  summary: string;
  code: string;
  annotations: Array<{
    title: string;
    description: string;
    lineStart: number;
    lineEnd: number;
  }>;
  parameters: Array<{
    name: string;
    label: string;
    type: "number" | "color";
    min?: number;
    max?: number;
    step?: number;
    default: number | string;
    description: string;
  }>;
}

const HEX_RE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;
const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function validateGenerationShape(raw: unknown): Validated<GenerationShape> {
  if (!raw || typeof raw !== "object") return { error: "response is not an object" };
  const r = raw as Record<string, unknown>;

  if (typeof r["code"] !== "string" || !r["code"].trim())
    return { error: "missing or empty 'code' string" };
  if (!Array.isArray(r["annotations"])) return { error: "'annotations' must be an array" };
  if (!Array.isArray(r["parameters"])) return { error: "'parameters' must be an array" };

  const code = r["code"] as string;
  const totalLines = code.split("\n").length;

  const annotations: GenerationShape["annotations"] = [];
  for (const a of r["annotations"] as unknown[]) {
    if (!a || typeof a !== "object") continue;
    const ar = a as Record<string, unknown>;
    if (typeof ar["title"] !== "string") continue;
    if (typeof ar["description"] !== "string") continue;
    const ls = Number(ar["lineStart"]);
    const le = Number(ar["lineEnd"]);
    if (!Number.isFinite(ls) || !Number.isFinite(le)) continue;
    annotations.push({
      title: ar["title"] as string,
      description: ar["description"] as string,
      lineStart: Math.max(1, Math.min(totalLines, Math.floor(ls))),
      lineEnd: Math.max(1, Math.min(totalLines, Math.floor(le))),
    });
  }

  const parameters: GenerationShape["parameters"] = [];
  for (const p of r["parameters"] as unknown[]) {
    if (!p || typeof p !== "object") continue;
    const pr = p as Record<string, unknown>;
    const name = pr["name"];
    const type = pr["type"];
    if (typeof name !== "string" || !IDENT_RE.test(name)) continue;
    if (type !== "number" && type !== "color") continue;
    const label = typeof pr["label"] === "string" ? (pr["label"] as string) : name;
    const description = typeof pr["description"] === "string" ? (pr["description"] as string) : "";
    if (type === "color") {
      const def = typeof pr["default"] === "string" && HEX_RE.test(pr["default"] as string)
        ? (pr["default"] as string)
        : "#000000";
      parameters.push({ name, label, type, default: def, description });
    } else {
      const def = Number(pr["default"]);
      const min = Number(pr["min"]);
      const max = Number(pr["max"]);
      const step = Number(pr["step"]);
      if (!Number.isFinite(def) || !Number.isFinite(min) || !Number.isFinite(max)) continue;
      parameters.push({
        name,
        label,
        type,
        default: def,
        min,
        max,
        step: Number.isFinite(step) && step > 0 ? step : 0.01,
        description,
      });
    }
  }

  if (annotations.length === 0) return { error: "no valid annotations were returned" };

  return {
    value: {
      title: typeof r["title"] === "string" ? (r["title"] as string) : "Untitled Sketch",
      summary: typeof r["summary"] === "string" ? (r["summary"] as string) : "",
      code,
      annotations,
      parameters,
    },
  };
}

router.post("/p5/generate", async (req, res) => {
  if (!client) {
    res.status(503).json({
      error: "OpenAI integration is not configured on this server.",
    });
    return;
  }

  const { prompt, image } = (req.body ?? {}) as {
    prompt?: string;
    image?: string;
  };

  if ((!prompt || typeof prompt !== "string" || prompt.trim().length === 0) && !image) {
    res
      .status(400)
      .json({ error: "Provide a prompt and/or an image to translate." });
    return;
  }

  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [];

  userContent.push({
    type: "text",
    text: `Designer prompt:\n${(prompt ?? "").trim() || "(no text prompt — interpret the attached image)"}`,
  });

  if (image && typeof image === "string" && image.startsWith("data:")) {
    userContent.push({ type: "image_url", image_url: { url: image } });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (parseErr) {
      logger.error({ raw }, "OpenAI returned non-JSON response");
      res.status(502).json({
        error: "AI returned an unparseable response. Please try again.",
      });
      return;
    }

    const validated = validateGenerationShape(parsed);
    if ("error" in validated) {
      logger.error({ raw, error: validated.error }, "OpenAI response failed schema validation");
      res.status(502).json({
        error: `AI response was malformed: ${validated.error}. Please try again.`,
      });
      return;
    }

    res.json(validated.value);
  } catch (err) {
    logger.error({ err }, "OpenAI generation failed");
    const message =
      err instanceof Error ? err.message : "Unknown OpenAI error";
    res.status(502).json({ error: `Generation failed: ${message}` });
  }
});

export default router;
