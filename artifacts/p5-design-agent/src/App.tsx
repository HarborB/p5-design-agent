import { useState, useEffect, useCallback } from "react";
import type { AppState, WorkflowStep, AssignmentAnalysis, VisualRules, GeneratedReport, AIActionLog } from "@/lib/types";
import { saveState, loadState } from "@/lib/storage";
import { analyzeAssignment, generateVisualRules, generateP5Scaffold, generateAIUseReport } from "@/lib/mockAgent";
import ProgressBar from "@/components/ProgressBar";
import AssignmentPanel from "@/components/AssignmentPanel";
import IntentPanel from "@/components/IntentPanel";
import CodeStudio from "@/components/CodeStudio";
import ReportPanel from "@/components/ReportPanel";

const STEP_ORDER: WorkflowStep[] = ["assignment", "intent", "rules", "code", "report"];

function getDefaultState(): AppState {
  const saved = loadState();
  return {
    currentStep: saved.currentStep ?? "assignment",
    assignmentText: saved.assignmentText ?? "",
    designIntent: saved.designIntent ?? "",
    assignmentAnalysis: saved.assignmentAnalysis ?? null,
    visualRules: saved.visualRules ?? null,
    generatedCode: saved.generatedCode ?? "",
    actionLogs: saved.actionLogs ?? [],
    report: saved.report ?? null,
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(getDefaultState);
  const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(() => {
    const s = new Set<WorkflowStep>();
    const saved = loadState();
    if (saved.assignmentAnalysis) s.add("assignment");
    if (saved.visualRules) { s.add("assignment"); s.add("intent"); s.add("rules"); }
    if (saved.generatedCode) { s.add("assignment"); s.add("intent"); s.add("rules"); s.add("code"); }
    if (saved.report) { s.add("assignment"); s.add("intent"); s.add("rules"); s.add("code"); s.add("report"); }
    return s;
  });

  const updateState = useCallback((partial: Partial<AppState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      saveState(next);
      return next;
    });
  }, []);

  function addLog(log: AIActionLog) {
    setState((prev) => {
      const logs = [...prev.actionLogs, log];
      saveState({ actionLogs: logs });
      return { ...prev, actionLogs: logs };
    });
  }

  function markStepComplete(step: WorkflowStep) {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }

  function advanceToNextStep(after: WorkflowStep) {
    const idx = STEP_ORDER.indexOf(after);
    if (idx < STEP_ORDER.length - 1) {
      const next = STEP_ORDER[idx + 1];
      updateState({ currentStep: next });
    }
  }

  function handleAssignmentAnalyzed(analysis: AssignmentAnalysis) {
    const { log } = analyzeAssignment(state.assignmentText);
    addLog(log);
    updateState({ assignmentAnalysis: analysis });
    markStepComplete("assignment");
    advanceToNextStep("assignment");
  }

  function handleRulesGenerated(rules: VisualRules) {
    if (!state.assignmentAnalysis) return;
    const { log } = generateVisualRules(state.assignmentAnalysis, state.designIntent);
    addLog(log);
    updateState({ visualRules: rules });
    markStepComplete("intent");
    markStepComplete("rules");
    advanceToNextStep("rules");
  }

  function handleScaffoldGenerated(code: string) {
    if (!state.visualRules) return;
    const { log } = generateP5Scaffold(state.visualRules);
    addLog(log);
    updateState({ generatedCode: code });
    markStepComplete("code");
  }

  function handleReportGenerated(report: GeneratedReport) {
    const { log } = generateAIUseReport(state.actionLogs, state.generatedCode);
    addLog(log);
    updateState({ report });
    markStepComplete("report");
  }

  function handleReset() {
    if (!window.confirm("Reset all session data? This cannot be undone.")) return;
    localStorage.removeItem("p5_design_agent_state");
    setState({
      currentStep: "assignment",
      assignmentText: "",
      designIntent: "",
      assignmentAnalysis: null,
      visualRules: null,
      generatedCode: "",
      actionLogs: [],
      report: null,
    });
    setCompletedSteps(new Set());
  }

  const { currentStep } = state;

  const panelTitles: Record<WorkflowStep, { title: string; subtitle: string }> = {
    assignment: {
      title: "Assignment Brief",
      subtitle: "Paste your assignment prompt or PDF text. The tool will break it down into tasks, requirements, constraints, and deliverables.",
    },
    intent: {
      title: "Design Intent",
      subtitle: "Describe what you want to create in your own words. Be specific about visual effects, geometry, movement, or artistic references.",
    },
    rules: {
      title: "Visual Rules",
      subtitle: "Based on your intent, a structured visual rule system will be generated — visual units, parameters, transformation logic, and shape grammar.",
    },
    code: {
      title: "Code Studio",
      subtitle: "Generate a commented p5.js scaffold, edit it in the Monaco Editor, run a live preview, and check for common errors.",
    },
    report: {
      title: "AI-Use Disclosure Report",
      subtitle: "Review your session action log and generate a transparency report documenting all AI assistance for academic integrity purposes.",
    },
  };

  const currentPanel = panelTitles[currentStep];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">p5.js Design Coding Agent</h1>
            <p className="text-xs text-gray-500 mt-0.5">A transparent scaffolding tool for design students — not an auto-homework machine.</p>
          </div>
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            Reset session
          </button>
        </div>
      </header>

      <ProgressBar
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(step) => updateState({ currentStep: step })}
      />

      <main className="max-w-5xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-gray-900">{currentPanel.title}</h2>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{currentPanel.subtitle}</p>
              </div>

              {currentStep === "assignment" && (
                <AssignmentPanel
                  assignmentText={state.assignmentText}
                  analysis={state.assignmentAnalysis}
                  onTextChange={(text) => updateState({ assignmentText: text })}
                  onAnalyze={handleAssignmentAnalyzed}
                />
              )}

              {(currentStep === "intent" || currentStep === "rules") && (
                <IntentPanel
                  designIntent={state.designIntent}
                  analysis={state.assignmentAnalysis}
                  rules={state.visualRules}
                  onIntentChange={(text) => updateState({ designIntent: text })}
                  onRulesGenerated={handleRulesGenerated}
                />
              )}

              {currentStep === "code" && (
                <CodeStudio
                  code={state.generatedCode}
                  rules={state.visualRules}
                  onCodeChange={(code) => updateState({ generatedCode: code })}
                  onScaffoldGenerated={handleScaffoldGenerated}
                  onContinue={() => {
                    markStepComplete("code");
                    advanceToNextStep("code");
                  }}
                />
              )}

              {currentStep === "report" && (
                <ReportPanel
                  logs={state.actionLogs}
                  code={state.generatedCode}
                  report={state.report}
                  onReportGenerated={handleReportGenerated}
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Workflow Guide</h3>
              <div className="space-y-3">
                <WorkflowStep
                  number="1"
                  label="Paste & analyse"
                  description="Paste your assignment brief and run analysis to extract key requirements."
                  done={completedSteps.has("assignment")}
                  active={currentStep === "assignment"}
                />
                <WorkflowStep
                  number="2"
                  label="Describe your intent"
                  description="Write what you want to create — visual effect, geometry, mood, references."
                  done={completedSteps.has("intent")}
                  active={currentStep === "intent"}
                />
                <WorkflowStep
                  number="3"
                  label="Generate visual rules"
                  description="Turn your intent into a structured visual rule system and shape grammar."
                  done={completedSteps.has("rules")}
                  active={currentStep === "rules"}
                />
                <WorkflowStep
                  number="4"
                  label="Edit & preview code"
                  description="Generate a scaffold, modify it with TODO markers, run a live preview."
                  done={completedSteps.has("code")}
                  active={currentStep === "code"}
                />
                <WorkflowStep
                  number="5"
                  label="Generate report"
                  description="Produce an AI-use disclosure report for academic transparency."
                  done={completedSteps.has("report")}
                  active={currentStep === "report"}
                />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3">Transparency Principles</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-gray-400 mt-0.5">→</span>
                  AI generates scaffolds, not finished work
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-gray-400 mt-0.5">→</span>
                  All outputs contain TODO markers for student completion
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-gray-400 mt-0.5">→</span>
                  Every AI action is logged with timestamp and input
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-gray-400 mt-0.5">→</span>
                  Authorship is estimated and disclosed transparently
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-gray-400 mt-0.5">→</span>
                  Session data stays in your browser — never sent to a server
                </li>
              </ul>
            </div>

            {state.actionLogs.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Session Log</h3>
                  <span className="text-xs text-gray-400">{state.actionLogs.length} action{state.actionLogs.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="space-y-1">
                  {state.actionLogs.slice(-5).map((log) => {
                    const labels: Record<string, string> = {
                      analyze_assignment: "Analysed assignment",
                      generate_rules: "Generated visual rules",
                      generate_scaffold: "Generated scaffold",
                      debug_code: "Debugged code",
                      generate_report: "Generated report",
                    };
                    return (
                      <div key={log.id} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                        {labels[log.actionType] || log.actionType}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function WorkflowStep({
  number,
  label,
  description,
  done,
  active,
}: {
  number: string;
  label: string;
  description: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className={["flex items-start gap-2.5 p-2 rounded", active ? "bg-gray-50" : ""].join(" ")}>
      <span
        className={[
          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5",
          done
            ? "bg-gray-800 text-white"
            : active
            ? "bg-gray-200 text-gray-700"
            : "bg-gray-100 text-gray-400",
        ].join(" ")}
      >
        {done ? (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          number
        )}
      </span>
      <div>
        <p className={["text-xs font-medium", active ? "text-gray-900" : done ? "text-gray-700" : "text-gray-400"].join(" ")}>
          {label}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
