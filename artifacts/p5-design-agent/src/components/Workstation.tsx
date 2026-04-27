import { useEffect, useMemo, useState } from "react";
import type { GenerationResult } from "@/lib/types";
import { applyParameterValuesWithReport } from "@/lib/codeRuntime";
import CodePanel from "./CodePanel";
import AnnotationPanel from "./AnnotationPanel";
import PreviewFrame from "./PreviewFrame";
import ControlsPanel from "./ControlsPanel";

interface WorkstationProps {
  result: GenerationResult;
  values: Record<string, number | string>;
  onValueChange: (name: string, value: number | string) => void;
  onReset: () => void;
  onNewSketch: () => void;
}

export default function Workstation({
  result,
  values,
  onValueChange,
  onReset,
  onNewSketch,
}: WorkstationProps) {
  const [selectedAnnotation, setSelectedAnnotation] = useState<number | null>(null);

  const { code: liveCode, unmatched } = useMemo(
    () => applyParameterValuesWithReport(result.code, result.parameters, values),
    [result.code, result.parameters, values],
  );

  useEffect(() => {
    if (unmatched.length > 0) {
      console.warn(
        `[p5 Studio] ${unmatched.length} parameter(s) did not match any 'let' declaration in the generated code:`,
        unmatched,
      );
    }
  }, [unmatched]);

  const highlighted =
    selectedAnnotation !== null ? result.annotations[selectedAnnotation] : null;

  return (
    <div className="h-screen flex flex-col lg-bg p-3 gap-3 overflow-hidden">
      {/* Floating glass top bar */}
      <header className="lg-glass rounded-3xl px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onNewSketch}
            className="lg-chip w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            title="New sketch"
            aria-label="New sketch"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            className="w-7 h-7 rounded-xl flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #fcd34d, #f59e0b)",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.55), 0 4px 12px -2px rgba(245,158,11,0.35)",
            }}
          />
          <div className="min-w-0">
            <h1 className="text-sm font-semibold leading-tight truncate text-neutral-900">{result.title}</h1>
            <p className="text-xs text-neutral-500 leading-tight truncate">{result.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-[0.2em] hidden md:inline">
            workstation
          </span>
        </div>
      </header>

      {/* Main floating panels — gaps reveal the ambient backdrop */}
      <div className="flex-1 flex gap-3 min-h-0">
        <div className="w-[44%] flex-shrink-0 flex gap-3">
          <div className="w-[58%] lg-panel rounded-3xl overflow-hidden">
            <CodePanel code={liveCode} highlightedAnnotation={highlighted} />
          </div>
          <div className="w-[42%] lg-panel rounded-3xl overflow-hidden">
            <AnnotationPanel
              annotations={result.annotations}
              selectedIndex={selectedAnnotation}
              onSelect={setSelectedAnnotation}
              title={result.title}
              summary={result.summary}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 lg-panel rounded-3xl overflow-hidden flex flex-col">
          <div className="px-4 py-2.5 border-b border-black/[0.06] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="lg-dot text-rose-500" style={{ backgroundColor: "currentColor" }} />
              <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Live Preview</span>
            </div>
            <span className="text-xs text-neutral-400 font-mono">p5.js</span>
          </div>
          <div className="flex-1 min-h-0">
            <PreviewFrame code={liveCode} />
          </div>
        </div>
      </div>

      {/* Floating glass control rack */}
      <div className="flex-shrink-0 h-44">
        <ControlsPanel
          parameters={result.parameters}
          values={values}
          onChange={onValueChange}
          onReset={onReset}
        />
      </div>
    </div>
  );
}
