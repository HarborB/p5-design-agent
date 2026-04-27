import { useState } from "react";
import type { AIActionLog, GeneratedReport } from "@/lib/types";
import { generateAIUseReport } from "@/lib/mockAgent";

interface ReportPanelProps {
  logs: AIActionLog[];
  code: string;
  report: GeneratedReport | null;
  onReportGenerated: (report: GeneratedReport) => void;
}

export default function ReportPanel({ logs, code, report, onReportGenerated }: ReportPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 700));
    const { result } = generateAIUseReport(logs, code);
    onReportGenerated(result);
    setIsGenerating(false);
  }

  function handleCopyReport() {
    if (!report) return;
    const text = formatReportAsText(report);
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function handleDownloadReport() {
    if (!report) return;
    const text = formatReportAsText(report);
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-use-disclosure-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const actionLabels: Record<string, string> = {
    analyze_assignment: "Assignment Analysis",
    generate_rules: "Visual Rules",
    generate_scaffold: "Code Scaffold",
    debug_code: "Code Debug",
    generate_report: "Report Generation",
  };

  return (
    <div className="space-y-5">
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-800">
        <strong>Academic Transparency Tool:</strong> This report documents all AI assistance used during your project. Review and supplement it before submission to ensure it accurately reflects your workflow.
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Action Log</h3>
        {logs.length === 0 ? (
          <div className="text-xs text-gray-400 border border-dashed border-gray-200 rounded p-4 text-center">
            No AI actions recorded yet. Use the tools in Steps 1–4 to build your action history.
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log.id} className="p-2.5 bg-gray-50 border border-gray-200 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-700">
                    {actionLabels[log.actionType] || log.actionType}
                  </span>
                  <span className="text-gray-400 font-mono">
                    {log.timestamp.slice(0, 19).replace("T", " ")}
                  </span>
                </div>
                <p className="text-gray-500 truncate">Input: {log.userInput}</p>
                <p className="text-gray-600 mt-0.5">Output: {log.outputSummary}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={logs.length === 0 || isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Generating…
            </>
          ) : (
            "Generate AI-Use Report"
          )}
        </button>

        {report && (
          <>
            <button
              onClick={handleCopyReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Copy
            </button>
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Download .txt
            </button>
          </>
        )}
      </div>

      {report && (
        <div className="space-y-5 pt-2">
          <hr className="border-gray-200" />
          <h3 className="text-sm font-semibold text-gray-700">AI-Use Disclosure Report</h3>

          <Section title="Overview">
            <p className="text-xs text-gray-700 leading-relaxed">{report.overview}</p>
          </Section>

          <Section title="AI Contributions">
            <ul className="space-y-1.5">
              {report.aiContributions.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="flex-shrink-0 text-gray-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Student Contributions">
            <ul className="space-y-1.5">
              {report.userContributions.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="flex-shrink-0 text-gray-400">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Authorship Estimate">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="h-full bg-gray-800 rounded-full"
                    style={{ width: `${report.authorshipEstimate.ai}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-mono w-20 text-right">
                  AI: {report.authorshipEstimate.ai}%
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="h-full bg-green-600 rounded-full"
                    style={{ width: `${report.authorshipEstimate.user}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600 font-mono w-20 text-right">
                  Student: {report.authorshipEstimate.user}%
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed pt-1">
                {report.authorshipEstimate.rationale}
              </p>
            </div>
          </Section>

          <Section title="Prompts Used">
            <ul className="space-y-1">
              {report.promptsUsed.map((p, i) => (
                <li key={i} className="text-xs text-gray-600 font-mono bg-gray-50 border border-gray-200 rounded px-2 py-1.5">
                  {p}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Academic Integrity Statement">
            <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded p-3">
              {report.integrityStatement}
            </p>
          </Section>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
            <strong>Before submitting:</strong> Review this report carefully and add any AI interactions not captured here. You are responsible for accurate disclosure.
          </div>
        </div>
      )}

      {!report && (
        <div className="border border-dashed border-gray-200 rounded-md p-6 text-center">
          <p className="text-sm text-gray-400">
            Click <strong>Generate AI-Use Report</strong> to create a disclosure report based on your session's action log.
          </p>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}

function formatReportAsText(report: GeneratedReport): string {
  return [
    "AI-USE DISCLOSURE REPORT",
    "========================",
    "",
    "OVERVIEW",
    report.overview,
    "",
    "AI CONTRIBUTIONS",
    ...report.aiContributions.map((c) => "• " + c),
    "",
    "STUDENT CONTRIBUTIONS",
    ...report.userContributions.map((c) => "• " + c),
    "",
    "AUTHORSHIP ESTIMATE",
    `AI: ${report.authorshipEstimate.ai}% | Student: ${report.authorshipEstimate.user}%`,
    report.authorshipEstimate.rationale,
    "",
    "PROMPTS USED",
    ...report.promptsUsed,
    "",
    "ACADEMIC INTEGRITY STATEMENT",
    report.integrityStatement,
  ].join("\n");
}
