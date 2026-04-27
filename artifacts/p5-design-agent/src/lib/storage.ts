import type { AppState, VisualRules, AssignmentAnalysis } from "./types";

const STORAGE_KEY = "p5_design_agent_state";

function migrateRules(rules: Partial<VisualRules> | null | undefined): VisualRules | null {
  if (!rules) return null;
  return {
    visualUnits: rules.visualUnits ?? [],
    parameters: rules.parameters ?? [],
    transformationLogic: rules.transformationLogic ?? [],
    spatialOrganization: rules.spatialOrganization ?? [],
    interactionIdeas: rules.interactionIdeas ?? [],
    shapeGrammar: rules.shapeGrammar ?? "",
  };
}

function migrateAnalysis(
  analysis: Partial<AssignmentAnalysis> | null | undefined
): AssignmentAnalysis | null {
  if (!analysis) return null;
  return {
    tasks: analysis.tasks ?? [],
    requirements: analysis.requirements ?? [],
    constraints: analysis.constraints ?? [],
    deliverables: analysis.deliverables ?? [],
  };
}

export function saveState(state: Partial<AppState>): void {
  try {
    const existing = loadState();
    const merged = { ...existing, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn("Failed to save state to localStorage:", e);
  }
}

export function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return {
      ...parsed,
      assignmentAnalysis: migrateAnalysis(parsed.assignmentAnalysis),
      visualRules: migrateRules(parsed.visualRules),
    };
  } catch (e) {
    console.warn("Failed to load state from localStorage:", e);
    return {};
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear state from localStorage:", e);
  }
}
