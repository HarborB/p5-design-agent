import type { WorkflowStep } from "@/lib/types";

const STEPS: { key: WorkflowStep; label: string; description: string }[] = [
  { key: "assignment", label: "1. Assignment", description: "Paste & analyse your brief" },
  { key: "intent", label: "2. Intent", description: "Describe your design goal" },
  { key: "rules", label: "3. Rules", description: "Generate visual rule system" },
  { key: "code", label: "4. Code Studio", description: "Edit & preview scaffold" },
  { key: "report", label: "5. Report", description: "AI-use disclosure report" },
];

const STEP_ORDER: WorkflowStep[] = ["assignment", "intent", "rules", "code", "report"];

interface ProgressBarProps {
  currentStep: WorkflowStep;
  completedSteps: Set<WorkflowStep>;
  onStepClick: (step: WorkflowStep) => void;
}

export default function ProgressBar({ currentStep, completedSteps, onStepClick }: ProgressBarProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  return (
    <div className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start gap-0">
          {STEPS.map((step, i) => {
            const isCompleted = completedSteps.has(step.key);
            const isCurrent = step.key === currentStep;
            const isAccessible = i <= currentIndex || isCompleted;

            return (
              <div key={step.key} className="flex items-start flex-1 min-w-0">
                <div className="flex flex-col items-center flex-1 min-w-0">
                  <button
                    onClick={() => isAccessible && onStepClick(step.key)}
                    disabled={!isAccessible}
                    className={[
                      "w-full text-left px-3 py-2 rounded-md transition-colors",
                      isCurrent
                        ? "bg-gray-900 text-white"
                        : isCompleted
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
                        : isAccessible
                        ? "text-gray-600 hover:bg-gray-100 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold",
                          isCurrent
                            ? "bg-white text-gray-900"
                            : isCompleted
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-500",
                        ].join(" ")}
                      >
                        {isCompleted && !isCurrent ? (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </span>
                      <span className="font-medium text-sm truncate">{step.label.split(". ")[1]}</span>
                    </div>
                    <p
                      className={[
                        "text-xs mt-0.5 ml-7 truncate",
                        isCurrent ? "text-gray-300" : "text-gray-400",
                      ].join(" ")}
                    >
                      {step.description}
                    </p>
                  </button>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex items-center pt-4 px-1 flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
