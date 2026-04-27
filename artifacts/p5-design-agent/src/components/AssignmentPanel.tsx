import { useState } from "react";
import type { AssignmentAnalysis } from "@/lib/types";
import { analyzeAssignment } from "@/lib/mockAgent";

const SAMPLE_ASSIGNMENT = `Create a p5.js sketch that generates a Bridget Riley-style moiré pattern using triangular tiles. Use a Tile class, lerp(), and explain the shape rules. The sketch should produce a high-contrast black-and-white optical pattern that creates the illusion of movement through systematic repetition and row-based wave offsets.`;

interface AssignmentPanelProps {
  assignmentText: string;
  analysis: AssignmentAnalysis | null;
  onTextChange: (text: string) => void;
  onAnalyze: (analysis: AssignmentAnalysis) => void;
}

export default function AssignmentPanel({
  assignmentText,
  analysis,
  onTextChange,
  onAnalyze,
}: AssignmentPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function handleAnalyze() {
    if (!assignmentText.trim()) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 600));
    const { result } = analyzeAssignment(assignmentText);
    onAnalyze(result);
    setIsAnalyzing(false);
  }

  function handleSample() {
    onTextChange(SAMPLE_ASSIGNMENT);
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Assignment Brief
          </label>
          <button
            onClick={handleSample}
            className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Load sample brief
          </button>
        </div>
        <textarea
          className="w-full h-40 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          placeholder="Paste your assignment brief here — e.g. the full text of your project brief or PDF content…"
          value={assignmentText}
          onChange={(e) => onTextChange(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">
          Paste the full text of your assignment brief. The more detail you provide, the more relevant the analysis.
        </p>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!assignmentText.trim() || isAnalyzing}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
      >
        {isAnalyzing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analysing…
          </>
        ) : (
          "Analyse Assignment"
        )}
      </button>

      {analysis && (
        <div className="space-y-4 pt-2">
          <hr className="border-gray-200" />
          <h3 className="text-sm font-semibold text-gray-700">Assignment Analysis</h3>

          <AnalysisSection title="Tasks" items={analysis.tasks} colour="bg-blue-50 text-blue-800 border-blue-100" />
          <AnalysisSection title="Requirements" items={analysis.requirements} colour="bg-amber-50 text-amber-800 border-amber-100" />
          <AnalysisSection title="Constraints" items={analysis.constraints} colour="bg-red-50 text-red-800 border-red-100" />
          <AnalysisSection title="Deliverables" items={analysis.deliverables} colour="bg-green-50 text-green-800 border-green-100" />
        </div>
      )}

      {!analysis && (
        <div className="border border-dashed border-gray-200 rounded-md p-6 text-center">
          <p className="text-sm text-gray-400">
            Paste your assignment brief above and click <strong>Analyse Assignment</strong> to break it down into tasks, requirements, constraints, and deliverables.
          </p>
        </div>
      )}
    </div>
  );
}

function AnalysisSection({
  title,
  items,
  colour,
}: {
  title: string;
  items: string[];
  colour: string;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className={`text-xs px-3 py-2 rounded border ${colour} flex items-start gap-2`}
          >
            <span className="flex-shrink-0 font-semibold">{i + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
