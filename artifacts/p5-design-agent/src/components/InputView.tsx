import { useRef, useState } from "react";
import { generateP5Sketch } from "@/lib/api";
import type { GenerationResult } from "@/lib/types";

const SAMPLE_PROMPTS = [
  "A Bridget Riley moiré pattern of black and white triangles with a wavy row offset.",
  "A flow field of pastel particles drifting across a dark background.",
  "Concentric rings of pulsing dots that respond to a wave parameter.",
  "An isometric grid of rotating cubes in a soft pastel palette.",
];

interface InputViewProps {
  prompt: string;
  imageDataUrl: string | null;
  onPromptChange: (s: string) => void;
  onImageChange: (dataUrl: string | null) => void;
  onGenerated: (result: GenerationResult) => void;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function InputView({
  prompt,
  imageDataUrl,
  onPromptChange,
  onImageChange,
  onGenerated,
}: InputViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    if (!prompt.trim() && !imageDataUrl) return;
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateP5Sketch({
        prompt: prompt.trim(),
        image: imageDataUrl ?? undefined,
      });
      onGenerated(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function ingestFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
    setError(null);
    const url = await readFileAsDataURL(file);
    onImageChange(url);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) ingestFile(file);
  }

  return (
    <div className="min-h-screen lg-bg flex flex-col p-3 gap-3">
      <header className="lg-glass rounded-2xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #fcd34d, #f59e0b)",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.35), 0 4px 12px -2px rgba(245,158,11,0.4)",
            }}
          />
          <div>
            <h1 className="text-sm font-semibold tracking-tight">p5 Studio</h1>
            <p className="text-xs text-neutral-400">Prompt-to-sketch design workstation</p>
          </div>
        </div>
        <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">v2.0</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-semibold tracking-tight mb-3 text-neutral-50">
              Describe a sketch.
            </h2>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto leading-relaxed">
              Type a prompt and/or drop a reference image. The model will translate it into a tunable p5.js composition.
            </p>
          </div>

          <div className="lg-panel rounded-3xl p-5 space-y-4">
            <div>
              <textarea
                value={prompt}
                onChange={(e) => onPromptChange(e.target.value)}
                placeholder="e.g. A Bridget Riley moiré pattern of black and white triangles with a wavy row offset."
                className="w-full h-28 bg-black/40 border border-white/[0.06] rounded-2xl p-4 text-sm text-neutral-100 placeholder-neutral-500 resize-none focus:outline-none focus:border-amber-500/60 focus:bg-black/60 transition-all"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-xs text-neutral-500 mr-1 self-center">Try:</span>
                {SAMPLE_PROMPTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onPromptChange(s)}
                    className="lg-chip text-xs px-3 py-1.5"
                  >
                    {s.split(" ").slice(0, 5).join(" ")}…
                  </button>
                ))}
              </div>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={[
                "rounded-2xl border-2 border-dashed p-4 transition-all cursor-pointer",
                isDragging
                  ? "border-amber-500/70 bg-amber-500/[0.08]"
                  : imageDataUrl
                    ? "border-white/10 bg-black/30"
                    : "border-white/[0.08] bg-black/20 hover:border-white/15 hover:bg-black/30",
              ].join(" ")}
            >
              {imageDataUrl ? (
                <div className="flex items-center gap-3">
                  <img src={imageDataUrl} alt="reference" className="w-16 h-16 object-cover rounded-xl border border-white/10" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-200">Reference image attached</p>
                    <p className="text-xs text-neutral-500 mt-0.5">The model will use this as visual guidance.</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageChange(null);
                    }}
                    className="text-xs text-neutral-400 hover:text-red-400 px-2 py-1 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-xs text-neutral-300">
                    Drop a reference image here or <span className="text-amber-400 underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">PNG, JPG, WEBP · max 5 MB · optional</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) await ingestFile(f);
                  e.target.value = "";
                }}
                onClick={(e) => e.stopPropagation()}
                className="hidden"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-2xl text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt.trim() && !imageDataUrl)}
              className="lg-primary w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-semibold"
            >
              {isGenerating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Translating to p5.js…
                </>
              ) : (
                <>
                  Translate
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-6">
            Powered by GPT — generations may take 10–30 seconds.
          </p>
        </div>
      </main>
    </div>
  );
}
