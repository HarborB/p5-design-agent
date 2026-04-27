import type { Parameter } from "@/lib/types";

interface ControlsPanelProps {
  parameters: Parameter[];
  values: Record<string, number | string>;
  onChange: (name: string, value: number | string) => void;
  onReset: () => void;
}

export default function ControlsPanel({
  parameters,
  values,
  onChange,
  onReset,
}: ControlsPanelProps) {
  return (
    <div className="lg-glass rounded-2xl h-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-white/[0.06] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="lg-dot text-emerald-400" style={{ backgroundColor: "currentColor" }} />
          <span className="text-xs font-semibold text-neutral-200 uppercase tracking-wider">
            Parameter Rack
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            {parameters.length} channel{parameters.length === 1 ? "" : "s"}
          </span>
        </div>
        <button
          onClick={onReset}
          className="lg-chip text-xs px-3 py-1"
        >
          Reset all
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-2 p-3 h-full min-w-max">
          {parameters.length === 0 ? (
            <p className="text-xs text-neutral-400 italic flex items-center px-3">
              No tweakable parameters were detected for this sketch.
            </p>
          ) : (
            parameters.map((param) => (
              <ChannelStrip
                key={param.name}
                param={param}
                value={values[param.name] ?? param.default}
                onChange={(v) => onChange(param.name, v)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function ChannelStrip({
  param,
  value,
  onChange,
}: {
  param: Parameter;
  value: number | string;
  onChange: (v: number | string) => void;
}) {
  if (param.type === "color") {
    const colorVal = typeof value === "string" ? value : "#000000";
    return (
      <div className="lg-subsurface w-32 flex-shrink-0 rounded-xl p-3 flex flex-col gap-2">
        <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold truncate" title={param.label}>
          {param.label}
        </div>
        <div className="flex-1 flex items-center justify-center">
          <label className="cursor-pointer block w-full h-16 rounded-lg border border-white/10 overflow-hidden relative">
            <div className="absolute inset-0" style={{ backgroundColor: colorVal }} />
            <input
              type="color"
              value={colorVal}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
              title={param.description}
            />
          </label>
        </div>
        <div className="text-[10px] font-mono text-neutral-300 text-center truncate" title={colorVal}>
          {colorVal.toUpperCase()}
        </div>
        <div className="text-[10px] font-mono text-neutral-500 truncate" title={param.name}>
          {param.name}
        </div>
      </div>
    );
  }

  const numVal = typeof value === "number" ? value : Number(value);
  const min = param.min ?? 0;
  const max = param.max ?? 1;
  const step = param.step ?? 0.01;
  const safeVal = Number.isFinite(numVal) ? numVal : Number(param.default);
  const pct = max === min ? 0 : ((safeVal - min) / (max - min)) * 100;

  return (
    <div
      className="lg-subsurface w-32 flex-shrink-0 rounded-xl p-3 flex flex-col gap-2"
      title={param.description}
    >
      <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-semibold truncate" title={param.label}>
        {param.label}
      </div>

      <div className="text-center">
        <span className="text-base font-mono font-semibold text-amber-300 tabular-nums">
          {step >= 1 ? safeVal.toFixed(0) : safeVal.toFixed(step >= 0.1 ? 1 : 2)}
        </span>
      </div>

      <div className="relative h-1.5 bg-black/40 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${Math.min(100, Math.max(0, pct))}%`,
            background: "linear-gradient(90deg, #f59e0b, #fcd34d)",
            boxShadow: "0 0 8px rgba(245, 158, 11, 0.5)",
          }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeVal}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-1 accent-amber-400 cursor-pointer"
      />

      <div className="flex items-center justify-between text-[9px] font-mono text-neutral-500">
        <span>{step >= 1 ? min.toFixed(0) : min.toFixed(2)}</span>
        <span>{step >= 1 ? max.toFixed(0) : max.toFixed(2)}</span>
      </div>

      <div className="text-[10px] font-mono text-neutral-500 truncate" title={param.name}>
        {param.name}
      </div>
    </div>
  );
}
