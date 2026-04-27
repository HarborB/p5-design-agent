import { useEffect, useRef, useState } from "react";

interface PreviewFrameProps {
  code: string;
}

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
  html, body { width: 100%; height: 100%; background: #ffffff; }
  body { display: flex; align-items: center; justify-content: center; overflow: hidden; }
  canvas { display: block; max-width: 100%; max-height: 100vh; }
  #error-display {
    position: absolute; top: 12px; left: 12px; right: 12px;
    padding: 10px 12px;
    background: rgba(127, 29, 29, 0.92);
    border: 1px solid #b91c1c;
    border-radius: 6px;
    color: #fee2e2;
    font-size: 11px;
    line-height: 1.4;
    white-space: pre-wrap;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    display: none;
    z-index: 10;
  }
</style>
</head>
<body>
<div id="error-display"></div>
<script>
window.onerror = function(msg, src, line, col, err) {
  var el = document.getElementById('error-display');
  if (el) { el.style.display = 'block'; el.textContent = 'Runtime error at line ' + line + ':\\n' + msg; }
  window.parent.postMessage({ type: 'p5-error', message: msg, line: line }, '*');
  return true;
};
</script>
<script>
try {
${sketchCode}
} catch(e) {
  var el = document.getElementById('error-display');
  if (el) { el.style.display = 'block'; el.textContent = 'Parse/setup error:\\n' + e.message; }
  window.parent.postMessage({ type: 'p5-error', message: e.message }, '*');
}
</script>
</body>
</html>`;
}

export default function PreviewFrame({ code }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iframeRef.current || !code) return;
    setError(null);
    const html = buildHtml(code);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const frame = iframeRef.current;
    const prevSrc = frame.src;
    frame.src = url;
    const cleanup = () => URL.revokeObjectURL(url);
    frame.onload = cleanup;
    return () => {
      cleanup();
      if (prevSrc.startsWith("blob:")) URL.revokeObjectURL(prevSrc);
    };
  }, [code]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only accept messages originating from our own iframe.
      if (
        !iframeRef.current ||
        event.source !== iframeRef.current.contentWindow
      ) {
        return;
      }
      if (event.data && event.data.type === "p5-error") {
        setError(event.data.message ?? "Unknown error");
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative w-full h-full bg-white">
      <iframe
        ref={iframeRef}
        title="p5.js Preview"
        sandbox="allow-scripts"
        className="w-full h-full border-0"
      />
      {error && (
        <div className="absolute bottom-3 left-3 right-3 p-2 bg-red-900/90 border border-red-700 rounded text-xs font-mono text-red-100">
          {error}
        </div>
      )}
    </div>
  );
}
