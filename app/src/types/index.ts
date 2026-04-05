export type Stage = "brainstorm" | "wireframe" | "prototype" | "build";

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
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  chatIds: string[];
  contextItems: ContextItem[];
  connectedKnowledge: KnowledgeCategory[];
  instructions: string;
}

export interface Chat {
  id: string;
  spaceId: string | null; // null = independent chat
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
  timestamp: string;
}

export type OutputFidelity = "exploration" | "wireframe" | "hi-fi" | "built";

export interface Output {
  id: string;
  messageId: string;
  chatId: string;
  spaceId: string | null;
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
  framework: "react" | "nextjs";
  files: ProjectFile[];
  routes: ProjectRoute[];
  dependencies: Record<string, string>;
  entryFile: string;
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

export interface ContainerTab {
  id: string;
  type: "document" | "prototype" | "code" | "canvas" | "output" | "preview";
  title: string;
  content: string;
  pinned?: boolean;
  closable?: boolean;
  buildProjectId?: string;
  filePath?: string;
  outputId?: string;
  contextItemId?: string;
}

export interface ContextItem {
  id: string;
  name: string;
  type: "document" | "link" | "image" | "spreadsheet" | "recording" | "figma";
  source: string; // e.g., "upload", "google-docs", "figma", "website"
  addedAt: string;
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
