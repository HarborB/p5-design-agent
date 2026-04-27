export interface AssignmentAnalysis {
  tasks: string[];
  requirements: string[];
  constraints: string[];
  deliverables: string[];
}

export type AttachedFileKind = "pdf" | "image";

export interface AttachedFile {
  id: string;
  name: string;
  mimeType: string;
  kind: AttachedFileKind;
  size: number;
  dataUrl: string;
  addedAt: string;
}

export interface VisualRules {
  visualUnits: string[];
  parameters: string[];
  transformationLogic: string[];
  spatialOrganization: string[];
  interactionIdeas: string[];
  shapeGrammar: string;
}

export interface AIActionLog {
  id: string;
  timestamp: string;
  actionType: "analyze_assignment" | "generate_rules" | "generate_scaffold" | "debug_code" | "generate_report";
  userInput: string;
  outputSummary: string;
}

export interface GeneratedReport {
  overview: string;
  promptsUsed: string[];
  aiContributions: string[];
  userContributions: string[];
  authorshipEstimate: {
    ai: number;
    user: number;
    rationale: string;
  };
  integrityStatement: string;
}

export type WorkflowStep = "assignment" | "intent" | "rules" | "code" | "report";

export interface AppState {
  currentStep: WorkflowStep;
  assignmentText: string;
  attachedFiles: AttachedFile[];
  designIntent: string;
  assignmentAnalysis: AssignmentAnalysis | null;
  visualRules: VisualRules | null;
  generatedCode: string;
  actionLogs: AIActionLog[];
  report: GeneratedReport | null;
}
