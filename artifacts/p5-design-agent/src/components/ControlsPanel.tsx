import { useRef } from "react";
import type { Parameter } from "@/lib/types";

interface ControlsPanelProps {
  parameters: Parameter[];
  values: Record<string, number | string>;
  onChange: (name: string, value: number | string) => void;
  onReset: () => void;
}

const CTRL_SIZE = 76; // diameter of every circular control (knob + color wheel)

export default function ControlsPanel({
  parameters,
  values,
  onChange,
  onReset,
}: ControlsPanelProps) {
  return (
    <div className="lg-glass rounded-3xl h-full flex flex-col overflow-hidden">
      <div className="px-4 py-2 border-b border-black/[0.06] flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="lg-dot text-emerald-500" style={{ backgroundColor: "currentColor" }} />
          <span className="text-xs font-semibold text-neutral-700 uppercase tracking-wider">
            Parameter Rack
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            {parameters.length} channel{parameters.length === 1 ? "" : "s"}
          </span>
        </div>
        <button onClick={onReset} className="lg-chip text-xs px-3 py-1">
          Reset all
        </button>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex items-center gap-4 px-4 py-2 h-full min-w-max">
          {parameters.length === 0 ? (
            <p className="text-xs text-neutral-500 italic flex items-center px-3">
              No tweakable parameters were detected for this sketch.
            </p>
          ) : (
            parameters.map((param) => (
              <Station
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

function Station({
  param,
  value,
  onChange,
}: {
  param: Parameter;
  value: number | string;
  onChange: (v: number | string) => void;
}) {
  const isColor = param.type === "color";
  const display = isColor
    ? (typeof value === "string" ? value : "#000000").toUpperCase()
    : formatNumber(typeof value === "number" ? value : Number(value), param.step ?? 0.01);

  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0" style={{ width: CTRL_SIZE + 16 }}>
      {isColor ? (
        <ColorWheel
          value={typeof value === "string" ? value : "#000000"}
          onChange={(v) => onChange(v)}
          title={param.description}
        />
      ) : (
        <Knob
          value={typeof value === "number" ? value : Number(value)}
          min={param.min ?? 0}
          max={param.max ?? 1}
          step={param.step ?? 0.01}
          onChange={(v) => onChange(v)}
          title={param.description}
          ariaLabel={param.label}
        />
      )}
      <div
        className="text-[10px] uppercase tracking-wider text-neutral-600 font-semibold truncate w-full text-center"
        title={param.label}
      >
        {param.label}
      </div>
      <div
        className="text-[11px] font-mono font-semibold text-neutral-900 tabular-nums truncate w-full text-center"
        title={display}
      >
        {display}
      </div>
    </div>
  );
}

function decimalsForStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 2;
  if (step >= 1) return 0;
  // count digits after the decimal point in step (e.g. 0.005 -> 3)
  const s = step.toString();
  const dot = s.indexOf(".");
  if (dot === -1) return 0;
  return Math.min(6, s.length - dot - 1);
}

function snapToStep(value: number, min: number, max: number, step: number): number {
  if (!Number.isFinite(step) || step <= 0) {
    return Math.max(min, Math.min(max, value));
  }
  // Snap relative to min so stepping respects the parameter's offset.
  const snapped = min + Math.round((value - min) / step) * step;
  const clamped = Math.max(min, Math.min(max, snapped));
  const decimals = decimalsForStep(step);
  return decimals > 0 ? Number(clamped.toFixed(decimals)) : clamped;
}

function formatNumber(v: number, step: number): string {
  if (!Number.isFinite(v)) return "0";
  return v.toFixed(decimalsForStep(step));
}

/* ---------------- Knob (numeric parameter) ---------------- */

const KNOB_SWEEP_START = -135; // degrees, signed (0 = 12 o'clock, + clockwise)
const KNOB_SWEEP_RANGE = 270;
const KNOB_DRAG_PX = 180; // pixels of vertical drag = full value range
const KNOB_TICK_COUNT = 25;

function Knob({
  value,
  min,
  max,
  step,
  onChange,
  title,
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  title?: string;
  ariaLabel?: string;
}) {
  const dragRef = useRef<{ startY: number; startValue: number }>({ startY: 0, startValue: 0 });
  const safeVal = Number.isFinite(value) ? value : min;
  const pct = max === min ? 0 : Math.min(1, Math.max(0, (safeVal - min) / (max - min)));
  const angle = KNOB_SWEEP_START + pct * KNOB_SWEEP_RANGE;

  const center = CTRL_SIZE / 2;
  const knobR = CTRL_SIZE / 2 - 8;
  const tickInnerR = CTRL_SIZE / 2 - 4;
  const tickOuterR = CTRL_SIZE / 2 - 0.5;
  const indicatorR = knobR - 9;

  // Pre-compute indicator position
  const indRad = ((angle - 90) * Math.PI) / 180;
  const indDx = Math.cos(indRad) * indicatorR;
  const indDy = Math.sin(indRad) * indicatorR;

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startY: e.clientY, startValue: safeVal };
    e.preventDefault();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1) return;
    const dy = dragRef.current.startY - e.clientY;
    const range = max - min;
    const raw = dragRef.current.startValue + (dy / KNOB_DRAG_PX) * range;
    const next = snapToStep(raw, min, max, step);
    if (next !== safeVal) onChange(next);
  }

  function handleWheel(e: React.WheelEvent<HTMLDivElement>) {
    e.preventDefault();
    const direction = e.deltaY < 0 ? 1 : -1;
    const next = snapToStep(safeVal + direction * step, min, max, step);
    if (next !== safeVal) onChange(next);
  }

  return (
    <div
      className="relative select-none"
      style={{ width: CTRL_SIZE, height: CTRL_SIZE, touchAction: "none" }}
      title={title}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={safeVal}
    >
      {/* Tick arc */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={CTRL_SIZE}
        height={CTRL_SIZE}
        viewBox={`0 0 ${CTRL_SIZE} ${CTRL_SIZE}`}
      >
        {Array.from({ length: KNOB_TICK_COUNT }).map((_, i) => {
          const t = i / (KNOB_TICK_COUNT - 1);
          const tickAngle = KNOB_SWEEP_START + t * KNOB_SWEEP_RANGE;
          const rad = ((tickAngle - 90) * Math.PI) / 180;
          const x1 = center + Math.cos(rad) * tickInnerR;
          const y1 = center + Math.sin(rad) * tickInnerR;
          const x2 = center + Math.cos(rad) * tickOuterR;
          const y2 = center + Math.sin(rad) * tickOuterR;
          const isActive = t <= pct + 1e-6;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? "rgb(245, 158, 11)" : "rgb(160, 174, 192)"}
              strokeOpacity={isActive ? 0.95 : 0.45}
              strokeWidth={1.4}
              strokeLinecap="round"
            />
          );
        })}
      </svg>

      {/* The knob body */}
      <div
        className="absolute rounded-full cursor-ns-resize"
        style={{
          width: knobR * 2,
          height: knobR * 2,
          top: center - knobR,
          left: center - knobR,
          background:
            "radial-gradient(circle at 35% 28%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.55) 30%, rgba(255,255,255,0) 55%), linear-gradient(155deg, #fbfcfe 0%, #e6e9ef 100%)",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow:
            "inset 0 -2px 4px rgba(15,18,32,0.07), inset 0 2px 2px rgba(255,255,255,0.95), 0 4px 10px -2px rgba(15,18,32,0.12), 0 1px 3px rgba(15,18,32,0.06)",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onWheel={handleWheel}
      >
        {/* Indicator dot inside the knob */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 7,
            height: 7,
            top: "50%",
            left: "50%",
            transform: `translate(calc(-50% + ${indDx}px), calc(-50% + ${indDy}px))`,
            background: "linear-gradient(180deg, #fbbf24, #f59e0b)",
            boxShadow:
              "0 0 6px rgba(245, 158, 11, 0.55), inset 0 1px 0 rgba(255,255,255,0.5)",
          }}
        />
      </div>
    </div>
  );
}

/* ---------------- ColorWheel (color parameter) ---------------- */

const COLOR_WHEEL_S = 85; // saturation %
const COLOR_WHEEL_L = 55; // lightness %

function ColorWheel({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (hex: string) => void;
  title?: string;
}) {
  const wheelRef = useRef<HTMLDivElement>(null);

  // Convert current hex to hue for indicator placement
  const currentHue = hexToHue(value);
  const indicatorR = CTRL_SIZE / 2 - 9;
  const indRad = ((currentHue - 90) * Math.PI) / 180;
  const indDx = Math.cos(indRad) * indicatorR;
  const indDy = Math.sin(indRad) * indicatorR;

  function pickFromEvent(e: React.PointerEvent<HTMLDivElement>) {
    const el = wheelRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;
    let angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    if (angle < 0) angle += 360;
    if (angle >= 360) angle -= 360;
    const hex = hslToHex(angle, COLOR_WHEEL_S, COLOR_WHEEL_L);
    onChange(hex);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pickFromEvent(e);
    e.preventDefault();
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.buttons !== 1) return;
    pickFromEvent(e);
  }

  return (
    <div
      ref={wheelRef}
      className="relative rounded-full cursor-pointer select-none"
      style={{
        width: CTRL_SIZE,
        height: CTRL_SIZE,
        touchAction: "none",
        background: `conic-gradient(from 0deg,
          hsl(0, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(30, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(60, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(90, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(120, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(150, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(180, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(210, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(240, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(270, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(300, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(330, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%),
          hsl(360, ${COLOR_WHEEL_S}%, ${COLOR_WHEEL_L}%))`,
        boxShadow:
          "inset 0 0 0 1px rgba(0,0,0,0.05), 0 4px 10px -2px rgba(15,18,32,0.12), 0 1px 3px rgba(15,18,32,0.06)",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      title={title}
    >
      {/* Soft white center disc to give it the "wheel" look from the reference */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: CTRL_SIZE * 0.42,
          height: CTRL_SIZE * 0.42,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.55) 60%, rgba(255,255,255,0) 100%)",
        }}
      />
      {/* Picked-hue indicator */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 10,
          height: 10,
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${indDx}px), calc(-50% + ${indDy}px))`,
          background: "#ffffff",
          border: "1.5px solid rgba(0,0,0,0.35)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
        }}
      />
    </div>
  );
}

/* ---------------- Color helpers (hex <-> hue) ---------------- */

function hslToHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = lN - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHue(hex: string): number {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return 0;
  const r = parseInt(m[1], 16) / 255;
  const g = parseInt(m[2], 16) / 255;
  const b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h = 0;
  if (max === r) h = ((g - b) / d) + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return h * 60;
}
