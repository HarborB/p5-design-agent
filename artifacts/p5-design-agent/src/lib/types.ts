export interface Annotation {
  title: string;
  description: string;
  lineStart: number;
  lineEnd: number;
}

export type ParameterType = "number" | "color";

export interface Parameter {
  name: string;
  label: string;
  type: ParameterType;
  min?: number;
  max?: number;
  step?: number;
  default: number | string;
  description: string;
}

export interface GenerationResult {
  title: string;
  summary: string;
  code: string;
  annotations: Annotation[];
  parameters: Parameter[];
}

export type Phase = "input" | "workstation";

export interface AppState {
  phase: Phase;
  prompt: string;
  imageDataUrl: string | null;
  result: GenerationResult | null;
  parameterValues: Record<string, number | string>;
}
