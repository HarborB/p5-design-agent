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
      <div className="px-4 py-2.5 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="lg-dot text-sky-400" style={{ backgroundColor: "currentColor" }} />
          <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">Annotations</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-3 border-b border-white/[0.06] bg-black/20">
          <p className="text-xs font-semibold text-neutral-100 leading-snug">{title}</p>
          {summary && (
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{summary}</p>
          )}
        </div>

        <div className="p-3 space-y-2">
          {annotations.length === 0 ? (
            <p className="text-xs text-neutral-500 italic px-2 py-4 text-center">No annotations.</p>
          ) : (
            annotations.map((ann, i) => {
              const isActive = selectedIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => onSelect(isActive ? null : i)}
                  className={[
                    "w-full text-left p-3 rounded-xl border transition-colors",
                    isActive
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className={[
                      "text-xs font-semibold leading-tight",
                      isActive ? "text-amber-300" : "text-neutral-100",
                    ].join(" ")}>
                      {ann.title}
                    </span>
                    <span className="flex-shrink-0 text-[10px] font-mono text-neutral-500 mt-0.5">
                      L{ann.lineStart}–{ann.lineEnd}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed">{ann.description}</p>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
