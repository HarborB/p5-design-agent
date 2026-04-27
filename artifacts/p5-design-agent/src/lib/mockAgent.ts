import type {
  AssignmentAnalysis,
  VisualRules,
  AIActionLog,
  GeneratedReport,
  AttachedFile,
} from "./types";

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function nowISO(): string {
  return new Date().toISOString();
}

function detectMoireKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("moire") ||
    lower.includes("moiré") ||
    lower.includes("triangle") ||
    lower.includes("bridget riley") ||
    lower.includes("row shift") ||
    lower.includes("triangular") ||
    lower.includes("wave") ||
    lower.includes("optical")
  );
}

export function analyzeAssignment(
  text: string,
  attachedFiles: AttachedFile[] = []
): {
  result: AssignmentAnalysis;
  log: AIActionLog;
} {
  const combinedText =
    text +
    " " +
    attachedFiles.map((f) => f.name).join(" ");
  const isMoire = detectMoireKeywords(combinedText);
  const fileNote =
    attachedFiles.length > 0
      ? ` Reviewed ${attachedFiles.length} attached file(s): ${attachedFiles.map((f) => f.name).join(", ")}.`
      : "";

  const result: AssignmentAnalysis = isMoire
    ? {
        tasks: [
          "Design and implement a Bridget Riley–inspired moiré pattern using p5.js",
          "Create a reusable Tile class to represent individual triangular units",
          "Apply lerp() to shift triangle vertices based on row position",
          "Document your shape grammar and explain the visual rules",
          "Reflect on how optical illusions emerge from systematic repetition",
        ],
        requirements: [
          "Use p5.js as the primary creative coding environment",
          "Implement a Tile class with a draw() method",
          "Use lerp() for smooth interpolation of triangle tip positions",
          "Create a grid of rows and columns of tiles",
          "Produce a high-contrast black-and-white composition",
        ],
        constraints: [
          "No external image assets — all geometry must be generated procedurally",
          "Code must be readable and commented for peer review",
          "Sketch should run at 600×600px canvas size",
          "No third-party p5.js libraries — only core p5.js",
        ],
        deliverables: [
          "Runnable p5.js sketch (.js file or embedded editor)",
          "Written explanation of shape grammar and design intent",
          "Process documentation showing iteration",
          "AI-use disclosure report if any generative tools were used",
        ],
      }
    : {
        tasks: [
          "Analyse and interpret the creative brief",
          "Plan the visual structure and algorithmic approach",
          "Implement the p5.js sketch with clean, commented code",
          "Test and refine the visual output",
        ],
        requirements: [
          "Use p5.js for all visual output",
          "Code must be structured and readable",
          "Sketch should run in a browser without additional setup",
        ],
        constraints: [
          "Work must be original and clearly authored by the student",
          "External assets should be documented if used",
          "Any AI assistance must be disclosed",
        ],
        deliverables: [
          "Working p5.js sketch",
          "Written design rationale",
          "AI-use disclosure if applicable",
        ],
      };

  const log: AIActionLog = {
    id: uid(),
    timestamp: nowISO(),
    actionType: "analyze_assignment",
    userInput:
      text.slice(0, 200) +
      (text.length > 200 ? "…" : "") +
      (attachedFiles.length > 0
        ? ` [+${attachedFiles.length} file(s): ${attachedFiles.map((f) => f.name).join(", ")}]`
        : ""),
    outputSummary: `Identified ${result.tasks.length} tasks, ${result.requirements.length} requirements, ${result.constraints.length} constraints, ${result.deliverables.length} deliverables.${fileNote}`,
  };

  return { result, log };
}

export function generateVisualRules(
  analysis: AssignmentAnalysis,
  intent: string
): { result: VisualRules; log: AIActionLog } {
  const isMoire = detectMoireKeywords(intent) || analysis.tasks.some((t) => detectMoireKeywords(t));

  const result: VisualRules = isMoire
    ? {
        visualUnits: [
          "Triangular tile — the atomic visual unit",
          "Tile grid — rectangular arrangement of N rows × M columns",
          "Row band — a horizontal strip where wave offset is uniform",
          "Wave envelope — a sinusoidal curve governing vertical shift per row",
        ],
        parameters: [
          "tileSize (number) — width and height of each square tile cell",
          "rows (number) — number of tile rows in the grid",
          "cols (number) — number of tile columns in the grid",
          "waveStrength (number 0–1) — amplitude of the row-shift wave",
          "waveFrequency (number) — how many wave cycles fit across the canvas",
          "randomness (number 0–1) — adds noise to prevent perfect regularity",
          "fillMode ('black' | 'white' | 'alternating') — tile colour logic",
        ],
        transformationLogic: [
          "For each row i, compute waveOffset = sin(i / rows * TWO_PI * waveFrequency) * waveStrength * tileSize",
          "Shift the apex (top vertex) of each upward-pointing triangle by waveOffset on the x-axis using lerp()",
          "Alternate fill colour between black and white based on (row + col) % 2",
          "Apply a small random perturbation scaled by randomness to each apex for organic texture",
        ],
        spatialOrganization: [
          "Rectangular grid of N rows × M columns covering the full 600×600 canvas",
          "Origin (0,0) at the top-left of the canvas; tiles laid out in row-major order",
          "Each row shares a single waveOffset, producing horizontal banding",
          "No padding between tiles — the grid is fully tessellated for moiré continuity",
          "Sliders positioned below the canvas (y = height + 10) in a horizontal strip",
        ],
        interactionIdeas: [
          "Slider: waveStrength — lets the student control moiré intensity in real time",
          "Slider: waveFrequency — changes how many wave crests appear across rows",
          "Slider: randomness — adds controlled disorder to the pattern",
          "Key 'r' — regenerates the random seed for a fresh composition",
          "Key 's' — saves a screenshot of the canvas",
        ],
        shapeGrammar:
          "Each tile cell is bisected diagonally into two triangles. The lower-left triangle is filled black; the upper-right is filled white. The shared diagonal vertex (apex) is shifted horizontally by a sine function of the row index, creating a wave across the grid that induces a moiré interference pattern when the viewer's eye integrates across rows.",
      }
    : {
        visualUnits: [
          "Primary visual element derived from the brief",
          "Compositional grid or arrangement structure",
          "Repeating module or tile unit",
        ],
        parameters: [
          "count (number) — quantity of visual elements",
          "size (number) — scale of each element",
          "spacing (number) — gap between elements",
          "speed (number) — animation rate if animated",
        ],
        transformationLogic: [
          "Apply systematic transformations to each element based on its index",
          "Use trigonometric functions for smooth variation",
          "Interpolate between states using lerp() for smooth transitions",
        ],
        spatialOrganization: [
          "Elements arranged across the canvas using a regular grid or mathematical curve",
          "Origin and spacing chosen to make positional rules easy to read",
          "Composition centred or anchored to give the eye a clear focal structure",
        ],
        interactionIdeas: [
          "Mouse position influences visual parameters",
          "Keyboard shortcuts for resetting or exporting",
          "Sliders for real-time parameter control",
        ],
        shapeGrammar:
          "A modular grid of elements where each unit inherits a base form and is transformed by a mathematical rule derived from its position, producing emergent visual complexity from simple local rules.",
      };

  const log: AIActionLog = {
    id: uid(),
    timestamp: nowISO(),
    actionType: "generate_rules",
    userInput: intent.slice(0, 200) + (intent.length > 200 ? "…" : ""),
    outputSummary: `Generated ${result.visualUnits.length} visual units, ${result.parameters.length} parameters, ${result.transformationLogic.length} transformation rules, ${result.spatialOrganization.length} spatial-organization notes, ${result.interactionIdeas.length} interaction ideas.`,
  };

  return { result, log };
}

export function generateP5Scaffold(rules: VisualRules): {
  result: string;
  log: AIActionLog;
} {
  const isMoire = rules.shapeGrammar.toLowerCase().includes("moire") ||
    rules.shapeGrammar.toLowerCase().includes("moiré") ||
    rules.shapeGrammar.toLowerCase().includes("triangle") ||
    rules.visualUnits.some(u => u.toLowerCase().includes("triangl"));

  let code: string;

  if (isMoire) {
    code = `// ============================================================
// Bridget Riley–style Moiré Pattern — p5.js Scaffold
// Generated by p5.js Design Coding Agent (scaffold only)
// TODO: Modify parameters and logic to make this your own work.
// ============================================================

// --- Global parameters ---
// TODO: Adjust these values to suit your composition
let tileSize = 30;       // Size of each tile cell in pixels
let rows, cols;           // Calculated from canvas size and tileSize
let waveStrength = 0.6;  // Amplitude of the moiré wave (0 = flat, 1 = full shift)
let waveFrequency = 3;   // How many wave cycles span the full grid height
let randomness = 0.05;   // Adds subtle noise to the apex position (0 = none)

// --- Sliders (created in setup) ---
let sliderWave, sliderFreq, sliderRandom;

// --- The Tile class ---
// Each tile represents one cell in the grid.
// It draws two triangles: black below-left, white above-right.
// The shared apex is shifted horizontally to create the wave.
class Tile {
  constructor(x, y, col, row) {
    this.x = x;           // Top-left corner x
    this.y = y;           // Top-left corner y
    this.col = col;       // Column index
    this.row = row;       // Row index
  }

  draw(apexShiftX) {
    // Bottom-left triangle (black fill)
    fill(0);
    noStroke();
    triangle(
      this.x,               this.y + tileSize,   // bottom-left
      this.x + tileSize,    this.y + tileSize,   // bottom-right
      this.x + apexShiftX,  this.y               // apex (shifted)
    );

    // Top-right triangle (white fill)
    fill(255);
    noStroke();
    triangle(
      this.x,               this.y,              // top-left
      this.x + tileSize,    this.y,              // top-right
      this.x + apexShiftX,  this.y + tileSize   // apex (shifted, mirrored)
    );

    // TODO: Try swapping fill colours, adding stroke, or using grayscale
    // to create different moiré effects.
  }
}

// --- Tile grid ---
let grid = [];

// ============================================================
function setup() {
  createCanvas(600, 600);

  // Calculate how many rows and columns fit in the canvas
  rows = floor(height / tileSize);
  cols = floor(width / tileSize);

  // Build the grid of tiles
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push(new Tile(c * tileSize, r * tileSize, c, r));
    }
  }

  // --- UI Sliders ---
  // TODO: Position and style these sliders to suit your layout

  // Wave strength slider (controls moiré intensity)
  sliderWave = createSlider(0, 1, waveStrength, 0.01);
  sliderWave.position(20, height + 10);
  sliderWave.style("width", "160px");

  // Wave frequency slider (controls number of wave crests)
  sliderFreq = createSlider(1, 10, waveFrequency, 0.1);
  sliderFreq.position(220, height + 10);
  sliderFreq.style("width", "160px");

  // Randomness slider (adds organic variation)
  sliderRandom = createSlider(0, 0.5, randomness, 0.005);
  sliderRandom.position(420, height + 10);
  sliderRandom.style("width", "160px");
}

// ============================================================
function draw() {
  background(240);

  // Read slider values each frame
  waveStrength = sliderWave.value();
  waveFrequency = sliderFreq.value();
  randomness = sliderRandom.value();

  // Draw each tile with its computed apex shift
  for (let tile of grid) {
    // Compute the horizontal apex shift for this row using a sine wave.
    // The sine function maps the row index to a value between -1 and +1.
    let wave = sin((tile.row / rows) * TWO_PI * waveFrequency);

    // Scale the wave by waveStrength and tileSize
    let shift = wave * waveStrength * tileSize;

    // TODO: Try using cos() instead of sin(), or combine both for complex patterns.

    // Add a small random perturbation for organic texture.
    // noise() is seeded per-tile so it doesn't flicker every frame.
    let rnd = (noise(tile.col * 0.3, tile.row * 0.3) - 0.5) * randomness * tileSize;

    // lerp() blends the apex from the unshifted position toward the shifted one.
    // The t value (waveStrength) controls how much of the shift is applied.
    let apexX = tile.x + lerp(tileSize / 2, tileSize / 2 + shift + rnd, waveStrength);

    tile.draw(apexX - tile.x);
  }

  // --- Labels ---
  // TODO: Style or remove these labels as you see fit
  fill(60);
  noStroke();
  textSize(11);
  text("Wave Strength: " + nf(waveStrength, 1, 2), 20, height + 35);
  text("Wave Frequency: " + nf(waveFrequency, 1, 1), 220, height + 35);
  text("Randomness: " + nf(randomness, 1, 3), 420, height + 35);
}

// ============================================================
// Key interactions
// TODO: Add more key bindings to explore your composition
function keyPressed() {
  if (key === "r" || key === "R") {
    // Regenerate noise seed for a fresh random variation
    noiseSeed(floor(random(10000)));
  }
  if (key === "s" || key === "S") {
    // Save a screenshot
    saveCanvas("moire_pattern", "png");
  }
}
`;
  } else {
    code = `// ============================================================
// p5.js Generative Sketch — Scaffold
// Generated by p5.js Design Coding Agent (scaffold only)
// TODO: Modify parameters and logic to make this your own work.
// ============================================================

// --- Global parameters ---
// TODO: Adjust these values to suit your composition
let count = 20;       // Number of visual elements
let elementSize = 20; // Base size of each element

// ============================================================
function setup() {
  createCanvas(600, 600);
  // TODO: Set frameRate() if you need a specific animation speed
}

// ============================================================
function draw() {
  background(240);

  // TODO: Implement your drawing logic here.
  // Use the visual rules and parameters identified in Step 2.

  for (let i = 0; i < count; i++) {
    let x = map(i, 0, count, 50, width - 50);
    let y = height / 2 + sin(i * 0.5 + frameCount * 0.02) * 100;

    // TODO: Replace this placeholder with your actual shape grammar
    fill(0);
    noStroke();
    ellipse(x, y, elementSize);
  }
}

// ============================================================
// Key interactions
// TODO: Add interactions that support your design intent
function keyPressed() {
  if (key === "s" || key === "S") {
    saveCanvas("sketch", "png");
  }
}
`;
  }

  const log: AIActionLog = {
    id: uid(),
    timestamp: nowISO(),
    actionType: "generate_scaffold",
    userInput: rules.shapeGrammar.slice(0, 200),
    outputSummary: `Generated p5.js scaffold (${code.split("\n").length} lines) with Tile class, setup(), draw(), and slider controls. Includes TODO comments for student modification.`,
  };

  return { result: code, log };
}

export function debugCode(code: string): {
  issues: Array<{ severity: "error" | "warning" | "info"; message: string }>;
  log: AIActionLog;
} {
  const issues: Array<{ severity: "error" | "warning" | "info"; message: string }> = [];

  if (!code.includes("function setup()") && !code.includes("function setup ()")) {
    issues.push({ severity: "error", message: "Missing setup() function — p5.js requires this to initialise the sketch." });
  }

  if (!code.includes("function draw()") && !code.includes("function draw ()")) {
    issues.push({ severity: "error", message: "Missing draw() function — p5.js calls this every frame to render your sketch." });
  }

  if (!code.includes("createCanvas(")) {
    issues.push({ severity: "error", message: "createCanvas() not found inside setup(). The canvas won't be created without this call." });
  }

  const openBraces = (code.match(/\{/g) || []).length;
  const closeBraces = (code.match(/\}/g) || []).length;
  if (openBraces !== closeBraces) {
    issues.push({
      severity: "error",
      message: `Unmatched braces: found ${openBraces} opening '{' and ${closeBraces} closing '}'. Check for missing or extra braces.`,
    });
  }

  if (code.includes("class Tile") && !code.includes("new Tile(")) {
    issues.push({ severity: "warning", message: "Tile class is defined but never instantiated with 'new Tile(...)'. The class won't have any effect." });
  }

  if (code.includes("new Tile(") && !code.includes("class Tile")) {
    issues.push({ severity: "error", message: "'new Tile(...)' used but no Tile class is defined. Add a class Tile { ... } block." });
  }

  if (code.includes("lerp(") && !code.includes("lerp(")) {
    issues.push({ severity: "info", message: "lerp() detected. Ensure all three arguments (start, end, t) are provided and that t is between 0 and 1." });
  }

  if (!code.includes("background(")) {
    issues.push({ severity: "warning", message: "No background() call found in draw(). Without clearing the background each frame, shapes will accumulate (ghost trail effect)." });
  }

  if (code.includes("console.log(")) {
    issues.push({ severity: "info", message: "console.log() found. This works but consider using text() to display values on the canvas for a cleaner workflow." });
  }

  if (code.includes("var ")) {
    issues.push({ severity: "info", message: "Using 'var' — prefer 'let' or 'const' for clearer scoping in modern JavaScript." });
  }

  if (issues.length === 0) {
    issues.push({ severity: "info", message: "No obvious issues detected. Run the preview to check the visual output." });
  }

  const log: AIActionLog = {
    id: uid(),
    timestamp: nowISO(),
    actionType: "debug_code",
    userInput: `Code (${code.split("\n").length} lines) submitted for analysis`,
    outputSummary: `Found ${issues.filter((i) => i.severity === "error").length} errors, ${issues.filter((i) => i.severity === "warning").length} warnings, ${issues.filter((i) => i.severity === "info").length} suggestions.`,
  };

  return { issues, log };
}

export function generateAIUseReport(
  logs: AIActionLog[],
  code: string
): { result: GeneratedReport; log: AIActionLog } {
  const analyzeLog = logs.find((l) => l.actionType === "analyze_assignment");
  const rulesLog = logs.find((l) => l.actionType === "generate_rules");
  const scaffoldLog = logs.find((l) => l.actionType === "generate_scaffold");
  const debugLogs = logs.filter((l) => l.actionType === "debug_code");

  const promptsUsed = logs.map((l) => {
    const labels: Record<string, string> = {
      analyze_assignment: "Assignment Analysis",
      generate_rules: "Visual Rules Generation",
      generate_scaffold: "Code Scaffold Generation",
      debug_code: "Code Debugging",
      generate_report: "AI-Use Report Generation",
    };
    return `[${l.timestamp.slice(0, 19).replace("T", " ")}] ${labels[l.actionType] || l.actionType}: "${l.userInput.slice(0, 80)}…"`;
  });

  const todoCount = (code.match(/TODO:/g) || []).length;
  const lineCount = code.split("\n").length;

  const aiContributions = [
    analyzeLog
      ? `Decomposed the assignment brief into tasks, requirements, constraints, and deliverables.`
      : null,
    rulesLog
      ? `Generated a visual rule system including ${rulesLog.outputSummary}`
      : null,
    scaffoldLog
      ? `Produced a commented p5.js scaffold (${lineCount} lines) with a Tile class, setup(), draw(), and interactive sliders. The scaffold contains ${todoCount} TODO markers indicating where the student must complete or modify the logic.`
      : null,
    debugLogs.length > 0
      ? `Ran ${debugLogs.length} code analysis session(s) and provided feedback on potential issues.`
      : null,
  ].filter(Boolean) as string[];

  const userContributions = [
    "Wrote and refined the assignment brief and personal design intent",
    `Modified or extended the generated scaffold — any changes made in the code editor after generation`,
    `Made all compositional decisions: colour palette, parameter values, waveStrength, waveFrequency, tileSize`,
    "Resolved the TODO markers in the scaffold with original logic",
    "Evaluated and tested the visual output, iterating until it met their design intent",
    "Authored the design rationale and process documentation",
  ];

  const aiPercent = scaffoldLog ? 45 : 20;
  const userPercent = 100 - aiPercent;

  const result: GeneratedReport = {
    overview: `This project used the p5.js Design Coding Agent as a transparent scaffolding tool during the design process. The AI assisted with structural analysis, visual rule articulation, and code scaffolding. All aesthetic decisions, parameter tuning, compositional choices, and iterative refinements were made independently by the student. The generated scaffold was intentionally incomplete, containing ${todoCount} TODO markers that required original student contribution to resolve.`,
    promptsUsed,
    aiContributions,
    userContributions,
    authorshipEstimate: {
      ai: aiPercent,
      user: userPercent,
      rationale: `The AI contributed approximately ${aiPercent}% — primarily through structural scaffolding, code architecture, and rule articulation. The student contributed approximately ${userPercent}% — through original design intent, parameter decisions, aesthetic refinements, TODO resolution, and iterative testing. The scaffold is not a finished work; it is a starting framework that required substantial independent authorship to complete.`,
    },
    integrityStatement: `This report documents all AI tool usage in the creation of this project, in accordance with academic integrity principles. The AI was used as a transparent scaffolding and learning aid, not as a means to automate or bypass the creative and intellectual work of the student. The student remains the primary author and is responsible for all design decisions, code modifications, and the final output. This disclosure was generated by the same AI tool and should be reviewed and supplemented by the student before submission.`,
  };

  const log: AIActionLog = {
    id: uid(),
    timestamp: nowISO(),
    actionType: "generate_report",
    userInput: `${logs.length} action logs, ${lineCount} lines of code`,
    outputSummary: `Generated AI-use report with authorship estimate: AI ${aiPercent}% / Student ${userPercent}%.`,
  };

  return { result, log };
}
