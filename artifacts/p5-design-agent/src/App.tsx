import { useCallback, useState } from "react";
import type { AppState, GenerationResult } from "@/lib/types";
import { saveState, loadState, clearState } from "@/lib/storage";
import { buildInitialValues } from "@/lib/codeRuntime";
import InputView from "@/components/InputView";
import Workstation from "@/components/Workstation";

function getDefaultState(): AppState {
  const saved = loadState();
  return {
    phase: saved.phase ?? "input",
    prompt: saved.prompt ?? "",
    imageDataUrl: saved.imageDataUrl ?? null,
    result: saved.result ?? null,
    parameterValues: saved.parameterValues ?? {},
  };
}

export default function App() {
  const [state, setState] = useState<AppState>(getDefaultState);

  const update = useCallback((partial: Partial<AppState>) => {
    setState((prev) => {
      const next = { ...prev, ...partial };
      saveState(next);
      return next;
    });
  }, []);

  function handleGenerated(result: GenerationResult) {
    const values = buildInitialValues(result.parameters);
    update({ result, parameterValues: values, phase: "workstation" });
  }

  function handleValueChange(name: string, value: number | string) {
    setState((prev) => {
      const nextValues = { ...prev.parameterValues, [name]: value };
      const next = { ...prev, parameterValues: nextValues };
      saveState(next);
      return next;
    });
  }

  function handleResetParameters() {
    if (!state.result) return;
    const values = buildInitialValues(state.result.parameters);
    update({ parameterValues: values });
  }

  function handleNewSketch() {
    if (!window.confirm("Start a new sketch? Current parameter values will be lost.")) return;
    clearState();
    setState({
      phase: "input",
      prompt: "",
      imageDataUrl: null,
      result: null,
      parameterValues: {},
    });
  }

  if (state.phase === "workstation" && state.result) {
    return (
      <Workstation
        result={state.result}
        values={state.parameterValues}
        onValueChange={handleValueChange}
        onReset={handleResetParameters}
        onNewSketch={handleNewSketch}
      />
    );
  }

  return (
    <InputView
      prompt={state.prompt}
      imageDataUrl={state.imageDataUrl}
      onPromptChange={(s) => update({ prompt: s })}
      onImageChange={(url) => update({ imageDataUrl: url })}
      onGenerated={handleGenerated}
    />
  );
}
