import type { GenerationResult } from "./types";

export interface GenerateRequest {
  prompt: string;
  image?: string;
}

export async function generateP5Sketch(
  req: GenerateRequest,
): Promise<GenerationResult> {
  const res = await fetch("/api/p5/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Server returned non-JSON response (${res.status}).`);
  }

  if (!res.ok) {
    const errBody = body as { error?: string };
    throw new Error(errBody?.error ?? `Request failed with status ${res.status}`);
  }

  const result = body as Partial<GenerationResult>;
  if (
    typeof result.code !== "string" ||
    !Array.isArray(result.annotations) ||
    !Array.isArray(result.parameters)
  ) {
    throw new Error("Server response is missing required fields (code, annotations, parameters).");
  }

  return {
    title: typeof result.title === "string" ? result.title : "Untitled Sketch",
    summary: typeof result.summary === "string" ? result.summary : "",
    code: result.code,
    annotations: result.annotations,
    parameters: result.parameters,
  };
}
