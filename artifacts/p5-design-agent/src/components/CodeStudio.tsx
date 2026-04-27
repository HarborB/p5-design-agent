import { useState } from "react";
import Editor from "@monaco-editor/react";
import type { VisualRules } from "@/lib/types";
import { generateP5Scaffold, debugCode } from "@/lib/mockAgent";
import PreviewFrame from "./PreviewFrame";

interface DebugIssue {
  severity: "error" | "warning" | "info";
  message: string;
}

interface CodeStudioProps {
  code: string;
  rules: VisualRules | null;
  onCodeChange: (code: string) => void;
  onScaffoldGenerated: (code: string) => void;
}

export default function CodeStudio({
  code,
  rules,
  onCodeChange,
  onScaffoldGenerated,
}: CodeStudioProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugIssues, setDebugIssues] = useState<DebugIssue[] | null>(null);
  const [previewTrigger, setPreviewTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");

  const isReady = !!rules;

  async function handleGenerate() {
    if (!rules) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const { result } = generateP5Scaffold(rules);
    onScaffoldGenerated(result);
    setIsGenerating(false);
    setDebugIssues(null);
  }

  async function handleDebug() {
    if (!code.trim()) return;
    setIsDebugging(true);
    await new Promise((r) => setTimeout(r, 500));
    const { issues } = debugCode(code);
    setDebugIssues(issues);
    setIsDebugging(false);
  }

  function handleRunPreview() {
    setPreviewTrigger((n) => n + 1);
    setActiveTab("preview");
  }

  const severityStyles: Record<string, string> = {
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-amber-50 border-amber-200 text-amber-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };
  const severityIcons: Record<string, string> = {
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className="space-y-4">
      {!isReady && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
          Complete <strong>Steps 1–3</strong> before generating code. Visual rules are needed to produce a meaningful scaffold.
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={!isReady || isGenerating}
          className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          {isGenerating ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating…
            </>
          ) : (
            "Generate Scaffold"
          )}
        </button>

        <button
          onClick={handleRunPreview}
          disabled={!code.trim()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
          Run Preview
        </button>

        <button
          onClick={handleDebug}
          disabled={!code.trim() || isDebugging}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
        >
          {isDebugging ? (
            <>
              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Checking…
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              Debug Code
            </>
          )}
        </button>

        {code && (
          <span className="text-xs text-gray-400 ml-auto">
            {code.split("\n").length} lines
          </span>
        )}
      </div>

      {debugIssues && (
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-gray-600">Debug Results</h4>
          {debugIssues.map((issue, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 text-xs px-3 py-2 border rounded ${severityStyles[issue.severity]}`}
            >
              <span className="font-bold flex-shrink-0">{severityIcons[issue.severity]}</span>
              <span>{issue.message}</span>
            </div>
          ))}
        </div>
      )}

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab("editor")}
            className={[
              "px-4 py-2 text-xs font-medium transition-colors",
              activeTab === "editor"
                ? "bg-white text-gray-900 border-b border-white -mb-px"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            Editor
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={[
              "px-4 py-2 text-xs font-medium transition-colors",
              activeTab === "preview"
                ? "bg-white text-gray-900 border-b border-white -mb-px"
                : "text-gray-500 hover:text-gray-700",
            ].join(" ")}
          >
            Preview
          </button>
        </div>

        {activeTab === "editor" ? (
          <div>
            {!code && (
              <div className="flex items-center justify-center h-64 text-gray-400 text-sm bg-gray-50">
                Click <strong className="mx-1">Generate Scaffold</strong> to create your p5.js starter code
              </div>
            )}
            {code && (
              <Editor
                height="480px"
                language="javascript"
                value={code}
                onChange={(v) => onCodeChange(v ?? "")}
                theme="vs"
                options={{
                  fontSize: 12,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  lineNumbers: "on",
                  folding: true,
                  renderWhitespace: "none",
                  padding: { top: 12, bottom: 12 },
                  fontFamily: "Menlo, Monaco, 'Courier New', monospace",
                }}
              />
            )}
          </div>
        ) : (
          <div className="p-3 bg-gray-50">
            <PreviewFrame code={code} triggerRun={previewTrigger} />
          </div>
        )}
      </div>

      <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-xs text-gray-500">
          <strong>Note:</strong> The generated scaffold is intentionally incomplete — it contains <code className="bg-gray-200 px-1 rounded">TODO</code> comments marking where you should modify parameters, complete logic, or express your own design decisions. The AI provides structure; the creative work is yours.
        </p>
      </div>
    </div>
  );
}
