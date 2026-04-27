import type { Annotation } from "@/lib/types";

interface AnnotationPanelProps {
  annotations: Annotation[];
  selectedIndex: number | null;
  onSelect: (idx: number | null) => void;
  title: string;
  summary: string;
}

export default function AnnotationPanel({
  annotations,
  selectedIndex,
  onSelect,
  title,
  summary,
}: AnnotationPanelProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2.5 border-b border-black/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="lg-dot text-sky-500" style={{ backgroundColor: "currentColor" }} />
          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">Annotations</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 border-b border-black/[0.06] bg-black/[0.015]">
          <p className="text-xs font-semibold text-neutral-900 leading-snug">{title}</p>
          {summary && (
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{summary}</p>
          )}
        </div>

        <div className="p-3 space-y-2">
          {annotations.length === 0 ? (
            <p className="text-xs text-neutral-400 italic px-2 py-4 text-center">No annotations.</p>
          ) : (
            annotations.map((ann, i) => {
              const isActive = selectedIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => onSelect(isActive ? null : i)}
                  className={[
                    "lg-press w-full text-left p-3 rounded-2xl border",
                    isActive
                      ? "bg-amber-50 border-amber-300 shadow-[0_4px_12px_-4px_rgba(245,158,11,0.25)]"
                      : "bg-white border-black/[0.06] hover:border-black/[0.10] hover:shadow-[0_4px_12px_-4px_rgba(15,18,32,0.10)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={[
                      "text-xs font-semibold leading-tight",
                      isActive ? "text-amber-800" : "text-neutral-900",
                    ].join(" ")}>
                      {ann.title}
                    </span>
                    <span className="flex-shrink-0 text-[10px] font-mono text-neutral-400 mt-0.5">
                      L{ann.lineStart}–{ann.lineEnd}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 leading-relaxed">{ann.description}</p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
