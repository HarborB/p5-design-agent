import { useEffect, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type { Annotation } from "@/lib/types";

type MonacoEditor = Parameters<OnMount>[0];
type MonacoApi = Parameters<OnMount>[1];

interface CodePanelProps {
  code: string;
  highlightedAnnotation: Annotation | null;
}

export default function CodePanel({ code, highlightedAnnotation }: CodePanelProps) {
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<MonacoApi | null>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    if (!highlightedAnnotation) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    const model = editor.getModel();
    const totalLines = model ? model.getLineCount() : code.split("\n").length;
    const start = Math.max(1, Math.min(totalLines, highlightedAnnotation.lineStart));
    const end = Math.max(start, Math.min(totalLines, highlightedAnnotation.lineEnd));

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new monaco.Range(start, 1, end, 1),
        options: {
          isWholeLine: true,
          className: "p5-annotation-highlight",
        },
      },
    ]);
    editor.revealLineInCenter(start);
  }, [highlightedAnnotation, code]);

  return (
    <div className="h-full flex flex-col bg-neutral-950 border-r border-neutral-800">
      <style>{`
        .p5-annotation-highlight {
          background-color: rgba(245, 158, 11, 0.12) !important;
          border-left: 2px solid rgb(245, 158, 11) !important;
        }
      `}</style>
      <div className="px-4 py-2.5 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">sketch.js</span>
        </div>
        <span className="text-xs text-neutral-500 font-mono">
          {code.split("\n").length} lines
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          theme="vs-dark"
          onMount={handleMount}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            wordWrap: "on",
            renderLineHighlight: "all",
            automaticLayout: true,
            padding: { top: 8, bottom: 8 },
          }}
        />
      </div>
    </div>
  );
}
