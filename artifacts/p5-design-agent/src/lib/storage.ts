import type { AppState } from "./types";

const STORAGE_KEY = "p5_design_agent_state";

export function saveState(state: Partial<AppState>): void {
  try {
    const existing = loadState();
    const merged = { ...existing, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch (e) {
    console.warn("Failed to save state to localStorage:", e);
  }
}

export function loadState(): Partial<AppState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<AppState>;
  } catch (e) {
    console.warn("Failed to load state from localStorage:", e);
    return {};
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn("Failed to clear state from localStorage:", e);
  }
}
