export type Stage = "brainstorm" | "wireframe" | "prototype" | "build";

export type TargetPlatform = "web" | "mobile" | "universal";

export type DevicePreset =
  | "desktop"
  | "tablet"
  | "iphone-15-pro"
  | "iphone-se"
  | "pixel-8";

export type OutputType =
  | "approach"
  | "wireframe"
  | "flow"
  | "screen"
  | "text_block"
  | "component";

export type KnowledgeCategory =
  | "about-company"
  | "feature-specs"
  | "business-logic"
  | "customers-personas"
  | "product-decisions"
  | "design-system";

export type ShellSourceRole = "reference" | "scaffold" | "component-source";

export type ShellMappingStatus = "open" | "resolved" | "deferred";

export interface ShellFigmaFrameRef {
  id: string;
  label: string;
  url: string;
  fileKey?: string;
  nodeId?: string;
  fileName?: string;
  pageName?: string;
  frameName?: string;
  role: ShellSourceRole;
  flowTag?: string;
}

export interface ShellGithubScopeRef {
  id: string;
  label: string;
  repo: string;
  branch: string;
  paths: string[];
  packages: string[];
}

export interface ShellSourceRefs {
  figmaFrameRefs: ShellFigmaFrameRef[];
  githubScopeRefs: ShellGithubScopeRef[];
}

export interface ShellDsSnapshotRef {
  snapshotId: string;
  name: string;
  version: string;
}

export interface ShellScaffoldPack {
  id: string;
  name: string;
  description: string;
  featureTag: string;
  sourceFrameIds: string[];
  recommendedComponentIds: string[];
  selected: boolean;
}

export interface ShellMappingReviewItem {
  id: string;
  frameRefId: string;
  figmaName: string;
  componentName: string | null;
  confidence: number;
  status: ShellMappingStatus;
  resolution?: "accept" | "remap" | "custom" | "defer";
}

export interface ShellDsUsageSummary {
  snapshotId?: string;
  componentIds: string[];
  componentNames: string[];
  notes?: string;
}

export interface ShellQuality {
  dsCoverage: number;
  tokenCompliance: number;
  unresolvedMappings: number;
  warnings: string[];
}

export interface Space {
  id: string;
  name: string;
  description: string;
  stage: Stage;
  /** Target platform that drives prompts, default device chrome, and mobile-first defaults. */
  targetPlatform: TargetPlatform;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  chatIds: string[];
  contextItems: ContextItem[];
  connectedKnowledge: KnowledgeCategory[];
  instructions: string;
  /** When this space was created via Remix from a shell. */
  remixedFromShellId?: string;
}

/** Reusable app scaffold: layout, tokens, and context; remix into a Space to build features. */
export interface Shell {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  contextItems: ContextItem[];
  connectedKnowledge: KnowledgeCategory[];
  instructions: string;
  techStack: string;
  designSystemNote: string;
  tokenPreferences: string;
  sourceRefs?: ShellSourceRefs;
  dsSnapshotRef?: ShellDsSnapshotRef;
  scaffoldPacks?: ShellScaffoldPack[];
  mappingReviewItems?: ShellMappingReviewItem[];
  dsUsageSummary?: ShellDsUsageSummary;
  quality?: ShellQuality;
  /** When this shell was saved from an existing space. */
  sourceSpaceId?: string;
}

export interface Chat {
  id: string;
  spaceId: string | null; // null = independent chat or shell chat
  /** When set, this chat belongs to a shell builder (mutually exclusive with spaceId for scoped work). */
  shellId: string | null;
  name: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

export interface Message {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  outputs: Output[];
  contextItemIds: string[];
  /** Base64 data URLs of marquee screenshots attached to this message. */
  screenshotUrls?: string[];
  /** True while assistant text is actively streaming in. */
  streaming?: boolean;
  /** True for mocked describer responses (e.g. /figma-describe on a Figma link). */
  mock?: boolean;
  /** Figma chip metadata when the user attached Figma link(s) to this message. */
  figmaAttachments?: Array<{ url: string; fileName?: string; frameName?: string }>;
  /** Set when this message is the streamed output of a skill (e.g. /prd, /user-flow). */
  skillName?: string;
  /** When the user has promoted the skill output to a Space context item, the new item's id. */
  savedAsContextItemId?: string;
  /** Set when this message is the result of /extract-components — used to render the Review button. */
  extractionId?: string;
  /** Structured progress state for the /extract-components loader. */
  extractionProgress?: {
    /** 0-based index of the currently-active step. */
    currentStepIndex: number;
    /** All steps complete + summary line ready. */
    done: boolean;
    /** Final summary shown once `done` flips true. */
    summary?: string;
  };
  timestamp: string;
}

export type OutputFidelity = "exploration" | "wireframe" | "hi-fi" | "built";

export interface Output {
  id: string;
  messageId: string;
  chatId: string;
  spaceId: string | null;
  /** Outputs generated while in a shell builder chat. */
  shellId: string | null;
  type: OutputType;
  title: string;
  summary: string;
  content: string;
  fidelity: OutputFidelity;
  kept: boolean;
  keptAt: string | null;
  canvasPosition: { x: number; y: number } | null;
  /** Set on built canvas items — links to `BuildProject.id` for Preview tab. */
  buildProjectId?: string;
  /** "mobile" outputs render in phone-frame thumbnails and route to native preview. */
  platform?: "web" | "mobile";
  /** Shell-generation metadata for mock provenance and reviewability. */
  shellMeta?: {
    scaffoldPackIds?: string[];
    dsComponentIds?: string[];
    dsSnapshotId?: string;
  };
}

export interface ProjectFile {
  id: string;
  path: string;
  name: string;
  content: string;
  language: "tsx" | "ts" | "css" | "json" | "html";
}

export interface ProjectRoute {
  path: string;
  label: string;
  filePath: string;
  /** Self-contained HTML for sandboxed iframe preview (until a real bundler exists). */
  previewHtml: string;
}

export interface BuildProject {
  id: string;
  outputId: string;
  name: string;
  framework: "react" | "nextjs" | "expo";
  files: ProjectFile[];
  routes: ProjectRoute[];
  dependencies: Record<string, string>;
  entryFile: string;
  /** Platform this build targets; drives DeviceFrame default and OnDevice tab variant. */
  targetPlatform?: TargetPlatform;
  /** Native source for the embedded Snack runner when targetPlatform is mobile. */
  snackSource?: string;
}

export interface InspectedElement {
  componentName: string;
  tagName: string;
  styles: {
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    color?: string;
    backgroundColor?: string;
    opacity?: string;
    borderColor?: string;
    borderWidth?: string;
    borderRadius?: string;
  };
}

export interface DesignNode {
  id: string;
  tag: string;
  name: string;
  type: "frame" | "text" | "image" | "component";
  x: number;
  y: number;
  width: number;
  height: number;
  styles: Record<string, string>;
  textContent?: string;
  src?: string;
  children: DesignNode[];
  parentId: string | null;
  locked: boolean;
  visible: boolean;
}

export interface ContainerTab {
  id: string;
  type:
    | "document"
    | "prototype"
    | "code"
    | "canvas"
    | "output"
    | "preview"
    | "design-editor"
    | "shell-app"
    | "on-device"
    | "component-extract";
  title: string;
  content: string;
  pinned?: boolean;
  closable?: boolean;
  buildProjectId?: string;
  filePath?: string;
  outputId?: string;
  contextItemId?: string;
  /** Set on `component-extract` tabs — points at the in-flight Extraction. */
  extractionId?: string;
}

export interface PreviewSession {
  id: string;
  deviceLabel: string;
  os: "ios" | "android" | "web";
  status: "live" | "paired" | "disconnected";
  /** ISO timestamp of the most recent ping/event from this device. */
  lastPing: string;
}

export interface PreviewEvent {
  id: string;
  timestamp: string;
  message: string;
  /** Round-trip in ms when applicable, e.g. for live-reload pushes. */
  durationMs?: number;
  sessionId?: string;
}

export interface ContextItem {
  id: string;
  name: string;
  type: "document" | "link" | "image" | "spreadsheet" | "recording" | "figma";
  source: string; // e.g., "upload", "google-docs", "figma", "website"
  addedAt: string;
  /** Raw body for user-added items (upload / paste); shown in document tab when set. */
  content?: string;
  /** Linked from product knowledge — already canonical; no “push” needed. */
  fromProductKnowledge?: boolean;
  /** Set when this space artifact was pushed to product knowledge. */
  pushedToProductKnowledgeAt?: string;
}

export interface KnowledgeItem {
  id: string;
  category: KnowledgeCategory;
  name: string;
  type: "document" | "link" | "image" | "spreadsheet" | "recording" | "figma";
  source: string;
  addedAt: string;
  content?: string;
  metadata?: {
    dsSnapshotId?: string;
    dsRunId?: string;
  };
}

// ---- Component extraction & PR ----

/** A single AI-extracted component candidate inside an Extraction. */
export interface ExtractedComponent {
  id: string;
  /** AI-proposed name (designer can rename in the review tab). */
  name: string;
  /** One-line, designer-friendly summary. */
  description: string;
  /** 2–3 lines of AI-style reasoning for why this is reusable. */
  reasoning: string;
  /** 0..100 — used to set defaultInclude and the quality bar in the UI. */
  qualityScore: number;
  /** Names of the captured states this pattern was found in. */
  sourceStateNames: string[];
  /** How many times the pattern repeats across the prototype. */
  usageCount: number;
  /** Whether this candidate is checked-on by default in the review tab. */
  defaultInclude: boolean;
  /** Renderer key — looked up in the client preview registry. Each key
   *  maps to a small hand-authored mini-sketch component that approximates
   *  what the extracted component looks like. */
  previewKey: string;
  /** Hand-authored TSX/JSX snippet shown when "Show code" expands. */
  code: { language: "tsx"; content: string };
  /** TypeScript-ish prop signature, shown alongside the code. */
  propsDefinition: string;
}

/** A single run of /extract-components — a list of candidates + selection state. */
export interface Extraction {
  id: string;
  spaceId: string;
  spaceName: string;
  createdAt: string;
  /** Candidate components, ordered by qualityScore desc. */
  components: ExtractedComponent[];
  /** Per-component selection state, keyed by component id. */
  selected: Record<string, boolean>;
  /** Set after the designer raises a PR from this extraction. */
  raisedPrSlug?: string;
}

export type ComponentPrStatus = "draft" | "open" | "merged";

export interface ComponentPRSnapshotComponent {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  qualityScore: number;
  sourceStateNames: string[];
  usageCount: number;
  previewKey: string;
  code: { language: "tsx"; content: string };
  propsDefinition: string;
}

export interface ComponentPR {
  id: string;
  slug: string;
  spaceId: string;
  spaceName: string;
  title: string;
  description: string;
  status: ComponentPrStatus;
  publishedAt: string;
  publishedBy: string;
  components: ComponentPRSnapshotComponent[];
}

// ---- Handover ----

export interface CapturedState {
  id: string;
  spaceId: string;
  name: string;
  group?: string;
  /** Base64 PNG data URL captured via html2canvas. */
  dataUrl: string;
  capturedAt: string;
  sourceKind: "output" | "shell-preview";
  sourceOutputId?: string;
  sourceShellId?: string;
}

export type HandoverStatus = "draft" | "open" | "accepted" | "shipped";

/**
 * Top-level section anchors plus item-scoped anchors of the form
 * `spec:<itemId>` or `knowledge:<itemId>` so comments can attach to a
 * specific Spec or Knowledge card on the public page.
 */
export type HandoverCommentAnchor =
  | "summary"
  | "prototype"
  | "figma"
  | "specs"
  | "knowledge"
  | "open-questions"
  | `spec:${string}`
  | `knowledge:${string}`;

export interface HandoverComment {
  id: string;
  handoverId: string;
  anchor: HandoverCommentAnchor;
  body: string;
  author: string;
  createdAt: string;
}

/** Snapshot of an included context item, frozen at publish time so the public page is stable. */
export interface HandoverContextItemSnapshot {
  id: string;
  name: string;
  type: ContextItem["type"];
  source: string;
  content?: string;
}

export interface HandoverKnowledgeSnapshot {
  id: string;
  name: string;
  category: KnowledgeCategory;
  type: KnowledgeItem["type"];
  content?: string;
}

export interface HandoverStateSnapshot {
  id: string;
  name: string;
  group?: string;
  dataUrl: string;
  sourceKind: CapturedState["sourceKind"];
}

export interface Handover {
  id: string;
  slug: string;
  spaceId: string;
  spaceName: string;
  version: number;
  title: string;
  summary: string;
  status: HandoverStatus;
  publishedAt: string;
  publishedBy: string;
  states: HandoverStateSnapshot[];
  contextItems: HandoverContextItemSnapshot[];
  knowledge: HandoverKnowledgeSnapshot[];
  openQuestions: string;
  /** Phase 2: filled when the Figma plugin completes section creation. */
  figmaSectionUrl?: string;
  figmaSectionThumbnailUrl?: string;
  /** Phase 3 fields. */
  comments?: HandoverComment[];
  /** Set on the previous version when a newer handover supersedes it. Holds the newer handover's id. */
  supersededBy?: string;
  /** Set on a new version pointing back at the immediate parent handover's id. */
  previousVersionId?: string;
}

/** Lightweight version row used by the public page's version pill strip. */
export interface HandoverVersionRef {
  id: string;
  slug: string;
  version: number;
  publishedAt: string;
  status: HandoverStatus;
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  description: string;
}

export type DsProvider = "github" | "figma";

export type DsConnectionStatus =
  | "connected"
  | "disconnected"
  | "syncing"
  | "error";

export interface DsConnection {
  provider: DsProvider;
  status: DsConnectionStatus;
  accountLabel?: string;
  resourceLabel?: string;
  lastSyncedAt?: string;
  errorMessage?: string;
}

export interface DsFoundationToken {
  id: string;
  name: string;
  value: string;
  description?: string;
}

export interface DsFoundationSection {
  id: string;
  title: string;
  tokens: DsFoundationToken[];
}

export interface DsComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
}

export interface DsComponentVariant {
  name: string;
  options: string[];
}

export interface DsComponentDefinition {
  id: string;
  name: string;
  description: string;
  importPath: string;
  status: "ready" | "draft";
  variants: DsComponentVariant[];
  props: DsComponentProp[];
}

export interface DsMapping {
  id: string;
  figmaName: string;
  codeComponent: string | null;
  confidence: number;
  status: "matched" | "needs_review" | "unmatched";
  note?: string;
  resolvedAt?: string;
}

export interface DsReviewItem {
  id: string;
  snapshotId: string;
  mappingId: string;
  title: string;
  recommendation: string;
  status: "open" | "resolved";
  resolution?: "accept" | "remap" | "mark_unmatched";
  resolvedAt?: string;
}

export interface DsSnapshot {
  id: string;
  name: string;
  version: string;
  createdAt: string;
  sourceRunId: string;
  active: boolean;
  summary: string;
  foundations: DsFoundationSection[];
  components: DsComponentDefinition[];
  mappings: DsMapping[];
}

export type DsRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "needs_review"
  | "failed";

export interface DsRun {
  id: string;
  name: string;
  createdAt: string;
  completedAt?: string;
  status: DsRunStatus;
  sources: DsProvider[];
  scopeLabel: string;
  strictMatching: boolean;
  snapshotId?: string;
  issueCount?: number;
  notes?: string;
}
