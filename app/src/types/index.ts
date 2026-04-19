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
    | "on-device";
  title: string;
  content: string;
  pinned?: boolean;
  closable?: boolean;
  buildProjectId?: string;
  filePath?: string;
  outputId?: string;
  contextItemId?: string;
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
}

export interface Integration {
  id: string;
  name: string;
  icon: string;
  connected: boolean;
  description: string;
}
