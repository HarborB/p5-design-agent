import type { Parameter } from "./types";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const HEX_COLOR_RE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/;

export function isValidHexColor(s: unknown): s is string {
  return typeof s === "string" && HEX_COLOR_RE.test(s);
}

function formatLiteral(param: Parameter, value: number | string): string {
  if (param.type === "color") {
    const candidate = isValidHexColor(value)
      ? value
      : isValidHexColor(param.default)
        ? (param.default as string)
        : "#000000";
    return `"${candidate}"`;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return String(param.default);
  return n.toString();
}

export interface ApplyParametersReport {
  code: string;
  unmatched: string[];
}

/**
 * Rewrites top-level `let <name> = <literal>;` declarations in the given code
 * so each parameter takes its current value from `values`. Returns the new code
 * AND a list of parameter names that did not match any declaration in the code,
 * which the host can surface or log.
 *
 * Line count is preserved so annotation line ranges remain valid.
 */
export function applyParameterValuesWithReport(
  code: string,
  parameters: Parameter[],
  values: Record<string, number | string>,
): ApplyParametersReport {
  let out = code;
  const unmatched: string[] = [];
  for (const param of parameters) {
    const literal = formatLiteral(param, values[param.name] ?? param.default);
    const pattern = new RegExp(
      `^([ \\t]*let\\s+${escapeRegExp(param.name)}\\s*=\\s*)([^;]*?)(\\s*;)`,
      "m",
    );
    let matched = false;
    out = out.replace(pattern, (_match, prefix, _old, suffix) => {
      matched = true;
      return `${prefix}${literal}${suffix}`;
    });
    if (!matched) unmatched.push(param.name);
  }
  return { code: out, unmatched };
}

export function applyParameterValues(
  code: string,
  parameters: Parameter[],
  values: Record<string, number | string>,
): string {
  return applyParameterValuesWithReport(code, parameters, values).code;
}

export function buildInitialValues(
  parameters: Parameter[],
): Record<string, number | string> {
  const initial: Record<string, number | string> = {};
  for (const p of parameters) {
    initial[p.name] = p.default;
  }
  return initial;
}
