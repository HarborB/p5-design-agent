import { useRef, useState } from "react";
import type { AssignmentAnalysis, AttachedFile, AttachedFileKind } from "@/lib/types";
import { analyzeAssignment } from "@/lib/mockAgent";

const SAMPLE_ASSIGNMENT = `Create a p5.js sketch that generates a Bridget Riley-style moiré pattern using triangular tiles. Use a Tile class, lerp(), and explain the shape rules. The sketch should produce a high-contrast black-and-white optical pattern that creates the illusion of movement through systematic repetition and row-based wave offsets.`;

const ACCEPTED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const ACCEPT_ATTR = "application/pdf,image/*";
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_TOTAL_BYTES = 15 * 1024 * 1024;

interface AssignmentPanelProps {
  assignmentText: string;
  attachedFiles: AttachedFile[];
  analysis: AssignmentAnalysis | null;
  onTextChange: (text: string) => void;
  onAttachedFilesChange: (files: AttachedFile[]) => void;
  onAnalyze: (analysis: AssignmentAnalysis) => void;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function classifyFile(mimeType: string): AttachedFileKind | null {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  return null;
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function AssignmentPanel({
  assignmentText,
  attachedFiles,
  analysis,
  onTextChange,
  onAttachedFilesChange,
  onAnalyze,
}: AssignmentPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (!assignmentText.trim() && attachedFiles.length === 0) return;
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 600));
    const { result } = analyzeAssignment(assignmentText, attachedFiles);
    onAnalyze(result);
    setIsAnalyzing(false);
  }

  function handleSample() {
    onTextChange(SAMPLE_ASSIGNMENT);
  }

  async function ingestFiles(files: FileList | File[]) {
    setFileError(null);
    const accepted: AttachedFile[] = [];
    const rejected: string[] = [];
    let runningTotal = attachedFiles.reduce((sum, f) => sum + f.size, 0);

    for (const file of Array.from(files)) {
      if (!ACCEPTED_MIME.includes(file.type) && !file.type.startsWith("image/")) {
        rejected.push(`${file.name} — unsupported type (${file.type || "unknown"})`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        rejected.push(`${file.name} — exceeds 5 MB per-file limit`);
        continue;
      }
      if (runningTotal + file.size > MAX_TOTAL_BYTES) {
        rejected.push(`${file.name} — would exceed 15 MB total session limit`);
        continue;
      }
      const kind = classifyFile(file.type);
      if (!kind) {
        rejected.push(`${file.name} — unsupported type`);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataURL(file);
        accepted.push({
          id: uid(),
          name: file.name,
          mimeType: file.type,
          kind,
          size: file.size,
          dataUrl,
          addedAt: new Date().toISOString(),
        });
        runningTotal += file.size;
      } catch {
        rejected.push(`${file.name} — could not be read`);
      }
    }

    if (accepted.length > 0) {
      onAttachedFilesChange([...attachedFiles, ...accepted]);
    }
    if (rejected.length > 0) {
      setFileError(rejected.join(" • "));
    }
  }

  function handleRemoveFile(id: string) {
    onAttachedFilesChange(attachedFiles.filter((f) => f.id !== id));
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await ingestFiles(e.dataTransfer.files);
    }
  }

  async function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      await ingestFiles(e.target.files);
      e.target.value = "";
    }
  }

  const canAnalyze = (assignmentText.trim().length > 0 || attachedFiles.length > 0) && !isAnalyzing;

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Brief Files (PDF or Image)
          </label>
          <span className="text-xs text-gray-400">
            {attachedFiles.length === 0
              ? "Optional — drag & drop below"
              : `${attachedFiles.length} attached`}
          </span>
        </div>

        <div
          onDragOver={handleDragOver}
          onDragEnter={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={[
            "w-full rounded-md border-2 border-dashed transition-colors cursor-pointer p-6 text-center",
            isDragging
              ? "border-gray-900 bg-gray-50"
              : "border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50",
          ].join(" ")}
        >
          <svg
            className={["w-8 h-8 mx-auto mb-2", isDragging ? "text-gray-900" : "text-gray-400"].join(" ")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 16a4 4 0 01-.88-7.9A5 5 0 1115.9 6 5.5 5.5 0 0118 16h-1m-6-3v9m0 0l-3-3m3 3l3-3"
            />
          </svg>
          <p className="text-sm text-gray-700 font-medium">
            {isDragging ? "Drop files to upload" : "Drop your assignment PDF or images here"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            or <span className="underline">browse</span> — PDF, PNG, JPG, WEBP, GIF · max 5 MB per file
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT_ATTR}
            multiple
            onChange={handleFileInputChange}
            onClick={(e) => e.stopPropagation()}
            className="hidden"
          />
        </div>

        {fileError && (
          <p className="text-xs text-red-600 mt-2 leading-relaxed">{fileError}</p>
        )}

        {attachedFiles.length > 0 && (
          <ul className="mt-3 space-y-2">
            {attachedFiles.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 p-2 border border-gray-200 rounded-md bg-white"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                  {f.kind === "image" ? (
                    <img src={f.dataUrl} alt={f.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-mono font-semibold text-gray-500">PDF</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{f.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {f.kind.toUpperCase()} · {formatSize(f.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(f.id);
                  }}
                  className="flex-shrink-0 text-xs text-gray-400 hover:text-red-600 px-2 py-1 rounded transition-colors"
                  aria-label={`Remove ${f.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
          Attachments are kept in your browser session and passed as context to every later step. When connected to a real multimodal LLM, the model will read PDF text and images directly.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            Assignment Brief Text
          </label>
          <button
            onClick={handleSample}
            className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2"
          >
            Load sample brief
          </button>
        </div>
        <textarea
          className="w-full h-40 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400"
          placeholder="Paste your assignment brief here — or leave blank if you've attached the PDF above."
          value={assignmentText}
          onChange={(e) => onTextChange(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">
          Use either the file drop, the textarea, or both. The more detail you provide, the more relevant the analysis.
        </p>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!canAnalyze}
        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
      >
        {isAnalyzing ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Analysing…
          </>
        ) : (
          "Analyse Assignment"
        )}
      </button>

      {analysis && (
        <div className="space-y-4 pt-2">
          <hr className="border-gray-200" />
          <h3 className="text-sm font-semibold text-gray-700">Assignment Analysis</h3>

          <AnalysisSection title="Tasks" items={analysis.tasks} colour="bg-blue-50 text-blue-800 border-blue-100" />
          <AnalysisSection title="Requirements" items={analysis.requirements} colour="bg-amber-50 text-amber-800 border-amber-100" />
          <AnalysisSection title="Constraints" items={analysis.constraints} colour="bg-red-50 text-red-800 border-red-100" />
          <AnalysisSection title="Deliverables" items={analysis.deliverables} colour="bg-green-50 text-green-800 border-green-100" />
        </div>
      )}

      {!analysis && (
        <div className="border border-dashed border-gray-200 rounded-md p-6 text-center">
          <p className="text-sm text-gray-400">
            Drop a PDF or paste your assignment brief above, then click <strong>Analyse Assignment</strong> to break it down into tasks, requirements, constraints, and deliverables.
          </p>
        </div>
      )}
    </div>
  );
}

function AnalysisSection({
  title,
  items,
  colour,
}: {
  title: string;
  items: string[];
  colour: string;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={i}
            className={`text-xs px-3 py-2 rounded border ${colour} flex items-start gap-2`}
          >
            <span className="flex-shrink-0 font-semibold">{i + 1}.</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
