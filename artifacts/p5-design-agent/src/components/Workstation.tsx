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
    <div className="h-screen flex flex-col bg-neutral-950 text-neutral-100 overflow-hidden">
      <header className="flex-shrink-0 border-b border-neutral-800 px-5 py-2.5 flex items-center justify-between bg-neutral-950">
        <div className="flex items-center gap-3">
          <button
            onClick={onNewSketch}
            className="w-7 h-7 rounded bg-gradient-to-br from-amber-300 to-amber-600 hover:opacity-80 transition-opacity flex items-center justify-center"
            title="New sketch"
          >
            <svg className="w-3.5 h-3.5 text-neutral-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-sm font-semibold leading-tight truncate max-w-md">{result.title}</h1>
            <p className="text-xs text-neutral-500 leading-tight truncate max-w-md">{result.summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-mono uppercase tracking-wider">workstation</span>
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <div className="w-[44%] flex-shrink-0 flex">
          <div className="w-[58%]">
            <CodePanel code={liveCode} highlightedAnnotation={highlighted} />
          </div>
          <div className="w-[42%]">
            <AnnotationPanel
              annotations={result.annotations}
              selectedIndex={selectedAnnotation}
              onSelect={setSelectedAnnotation}
              title={result.title}
              summary={result.summary}
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col bg-black">
          <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Live Preview</span>
            </div>
            <span className="text-xs text-neutral-500 font-mono">p5.js</span>
          </div>
          <div className="flex-1 min-h-0">
            <PreviewFrame code={liveCode} />
          </div>
        </div>
      </div>

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
