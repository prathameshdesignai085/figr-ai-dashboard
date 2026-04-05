import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  TLBaseShape,
} from "tldraw";
import { markdownToHtml } from "@/lib/markdown-to-html";
import { buildCanvasInspectSrcDoc } from "@/components/workspace/build-preview/inspect-bridge";
import { InspectableCanvasIframe } from "./inspectable-canvas-iframe";

// Augment tldraw's shape props map so our custom type is recognized
declare module "@tldraw/tlschema" {
  interface TLGlobalShapePropsMap {
    "output-card": {
      w: number;
      h: number;
      outputType: string;
      title: string;
      content: string;
      fidelity: string;
    };
  }
}

// --- Shape type ---

type OutputCardShape = TLBaseShape<
  "output-card",
  {
    w: number;
    h: number;
    outputType: string;
    title: string;
    content: string;
    fidelity: string;
  }
>;

// --- Fidelity badge config ---

const fidelityBadge: Record<
  string,
  { label: string; bg: string; text: string; pulse?: boolean } | null
> = {
  exploration: null,
  wireframe: {
    label: "Wireframe",
    bg: "rgba(59,130,246,0.1)",
    text: "rgb(96,165,250)",
  },
  "hi-fi": {
    label: "Hi-fi",
    bg: "rgba(45,212,191,0.1)",
    text: "rgb(45,212,191)",
  },
  built: {
    label: "Live",
    bg: "rgba(34,197,94,0.1)",
    text: "rgb(74,222,128)",
    pulse: true,
  },
};

// --- Type icon SVGs (inline, tiny) ---

const typeIcons: Record<string, string> = {
  approach: "💡",
  wireframe: "📐",
  flow: "🔀",
  screen: "🖥",
  text_block: "T",
  component: "⬡",
};

const typeLabels: Record<string, string> = {
  approach: "approach",
  wireframe: "wireframe",
  flow: "flow",
  screen: "screen",
  text_block: "document",
  component: "component",
};

// --- ShapeUtil ---

export class OutputCardShapeUtil extends BaseBoxShapeUtil<OutputCardShape> {
  static override type = "output-card" as const;

  static override props = {
    w: T.number,
    h: T.number,
    outputType: T.string,
    title: T.string,
    content: T.string,
    fidelity: T.string,
  };

  override getDefaultProps(): OutputCardShape["props"] {
    return {
      w: 420,
      h: 340,
      outputType: "screen",
      title: "Untitled",
      content: "",
      fidelity: "exploration",
    };
  }

  override canEdit() {
    return false;
  }

  override canResize() {
    return true;
  }

  component(shape: OutputCardShape) {
    const { outputType, title, content, fidelity } = shape.props;
    const badge = fidelityBadge[fidelity] ?? null;
    const icon = typeIcons[outputType] || "📄";
    const label = typeLabels[outputType] || outputType;
    const isHtmlContent = content.trim().startsWith("<");
    const outputId = shape.id.replace(/^shape:/, "");
    const htmlSrcDoc = isHtmlContent
      ? buildCanvasInspectSrcDoc(content, outputId)
      : "";

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "all",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            position: "relative",
          }}
        >
          {/* Thin header bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, opacity: 0.4 }}>{icon}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "rgba(255,255,255,0.4)",
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </span>
            {badge && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: badge.bg,
                  color: badge.text,
                  fontSize: 9,
                  fontWeight: 600,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                {badge.pulse && (
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: badge.text,
                      display: "inline-block",
                      animation: "pulse 2s ease-in-out infinite",
                    }}
                  />
                )}
                {badge.label}
              </div>
            )}
          </div>

          {/* Content area */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            {isHtmlContent ? (
              <InspectableCanvasIframe
                srcDoc={htmlSrcDoc}
                title={title}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "white",
                }}
              />
            ) : (
              // Render markdown content
              <div
                style={{
                  padding: "12px 16px",
                  height: "100%",
                  overflow: "auto",
                }}
                dangerouslySetInnerHTML={{
                  __html: markdownToHtml(content),
                }}
              />
            )}
          </div>
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: OutputCardShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={12}
        ry={12}
      />
    );
  }
}
