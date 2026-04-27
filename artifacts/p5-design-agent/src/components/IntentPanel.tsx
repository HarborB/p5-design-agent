import { useState } from "react";
import type { AssignmentAnalysis, VisualRules } from "@/lib/types";
import { generateVisualRules } from "@/lib/mockAgent";

const SAMPLE_INTENT = `I want to create a black-and-white moiré pattern using triangular tiles arranged in rows. Each tile is divided diagonally into a black triangle and a white triangle. A sine wave function shifts the shared apex of each row of triangles horizontally, creating the illusion of movement and optical interference across the grid. I want to control the wave strength and frequency with sliders.`;

interface IntentPanelProps {
  designIntent: string;
  analysis: AssignmentAnalysis | null;
  rules: VisualRules | null;
  onIntentChange: (text: string) => void;
  onRulesGenerated: (rules: VisualRules) => void;
}

export default function IntentPanel({
  designIntent,
  analysis,
  rules,
  onIntentChange,
  onRulesGenerated,
}: IntentPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerate() {
    if (!designIntent.trim() || !analysis) return;
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 700));
    const { result } = generateVisualRules(analysis, designIntent);
    onRulesGenerated(result);
    setIsGenerating(false);
  }

  function handleSample() {
    onIntentChange(SAMPLE_INTENT);
  }

  const isReady = !!analysis;

  return (
    <div className="space-y-5">
      {!isReady && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-700">
          Complete <strong>Step 1: Assignment Analysis</strong> before describing your design intent.
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Design Intent
          </label>
          <button
            onClick={handleSample}
            disabled={!isReady}
            className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2 disabled:opacity-40"
          >
            Load sample intent
          </button>
        </div>
        <textarea
          className="w-full h-36 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 disabled:bg-gray-50 disabled:text-gray-400"
          placeholder={'Describe your design goal in your own words. What do you want the sketch to look like? What visual effect are you after? E.g. "I want black-and-white triangular tiles in rows, with row shifts creating a wave-like moire movement."'}
          value={designIntent}
          onChange={(e) => onIntentChange(e.target.value)}
          disabled={!isReady}
        />
        <p className="text-xs text-gray-400 mt-1">
          Write in plain language. Mention visual effects, geometry, colour, movement, or references (e.g. Bridget Riley, Vasarely, Op Art).
        </p>
      </div>

      <button
        onClick={handleGenerate}
        disabled={!designIntent.trim() || !isReady || isGenerating}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
      >
        {isGenerating ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Generating rules…
          </>
        ) : (
          "Generate Visual Rules"
        )}
      </button>

      {rules && (
        <div className="space-y-4 pt-2">
          <hr className="border-gray-200" />
          <h3 className="text-sm font-semibold text-gray-700">Visual Rule System</h3>

          <RulesSection title="Visual Units" items={rules.visualUnits} icon="◆" />
          <RulesSection title="Parameters" items={rules.parameters} icon="⚙" />
          <RulesSection title="Transformation Logic" items={rules.transformationLogic} icon="→" />
          <RulesSection title="Spatial Organization" items={rules.spatialOrganization} icon="▦" />
          <RulesSection title="Interaction Ideas" items={rules.interactionIdeas} icon="↕" />

          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shape Grammar</h4>
            <p className="text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded p-3 leading-relaxed">
              {rules.shapeGrammar}
            </p>
          </div>
        </div>
      )}

      {!rules && (
        <div className="border border-dashed border-gray-200 rounded-md p-6 text-center">
          <p className="text-sm text-gray-400">
            Describe your design intent above and click <strong>Generate Visual Rules</strong> to create a structured visual rule system from your description.
          </p>
        </div>
      )}
    </div>
  );
}

function RulesSection({ title, items, icon }: { title: string; items: string[]; icon: string }) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
            <span className="flex-shrink-0 text-gray-400 font-mono">{icon}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
