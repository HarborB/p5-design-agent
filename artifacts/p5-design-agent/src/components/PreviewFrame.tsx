import { useRef, useEffect, useState } from "react";

interface PreviewFrameProps {
  code: string;
  triggerRun: number;
}

export default function PreviewFrame({ code, triggerRun }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (triggerRun === 0) return;
    runPreview();
  }, [triggerRun]);

  function buildHtml(sketchCode: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>p5.js Preview</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js"></script>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #f0f0f0; display: flex; flex-direction: column; align-items: center; padding: 12px; font-family: system-ui, sans-serif; }
  canvas { display: block; }
  #error-display {
    display: none;
    width: 100%;
    max-width: 600px;
    margin-top: 12px;
    padding: 12px;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 6px;
    color: #991b1b;
    font-size: 12px;
    white-space: pre-wrap;
    font-family: monospace;
  }
</style>
</head>
<body>
<div id="error-display"></div>
<script>
window.onerror = function(msg, src, line, col, err) {
  var el = document.getElementById('error-display');
  if (el) {
    el.style.display = 'block';
    el.textContent = 'Runtime error at line ' + line + ':\\n' + msg;
  }
  window.parent.postMessage({ type: 'p5-error', message: msg, line: line }, '*');
  return true;
};
</script>
<script>
try {
${sketchCode}
} catch(e) {
  var el = document.getElementById('error-display');
  if (el) {
    el.style.display = 'block';
    el.textContent = 'Parse/setup error:\\n' + e.message;
  }
  window.parent.postMessage({ type: 'p5-error', message: e.message }, '*');
}
</script>
</body>
</html>`;
  }

  function runPreview() {
    if (!iframeRef.current) return;
    setIsLoading(true);
    setError(null);

    const html = buildHtml(code);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    iframeRef.current.src = url;
    iframeRef.current.onload = () => {
      setIsLoading(false);
      URL.revokeObjectURL(url);
    };
  }

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data && event.data.type === "p5-error") {
        setError(event.data.message);
        setIsLoading(false);
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="space-y-2">
      <div className="relative border border-gray-200 rounded-md overflow-hidden bg-gray-100" style={{ minHeight: 400 }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Loading preview…
            </div>
          </div>
        )}
        {triggerRun === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">Click <strong>Run Preview</strong> to see your sketch</p>
            </div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="w-full"
          style={{ height: 480, border: "none" }}
          sandbox="allow-scripts"
          title="p5.js Preview"
        />
      </div>
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-xs font-semibold text-red-700 mb-1">Runtime Error</p>
          <p className="text-xs text-red-600 font-mono">{error}</p>
        </div>
      )}
    </div>
  );
}
