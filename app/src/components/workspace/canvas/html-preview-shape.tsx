import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  TLBaseShape,
} from "tldraw";
import { buildCanvasInspectSrcDoc } from "@/components/workspace/build-preview/inspect-bridge";
import { InspectableCanvasIframe } from "./inspectable-canvas-iframe";

// Augment tldraw's shape props map so our custom type is recognized
declare module "@tldraw/tlschema" {
  interface TLGlobalShapePropsMap {
    "html-preview": {
      w: number;
      h: number;
      title: string;
      htmlContent: string;
    };
  }
}

// --- Shape type ---

type HtmlPreviewShape = TLBaseShape<
  "html-preview",
  {
    w: number;
    h: number;
    title: string;
    htmlContent: string;
  }
>;

// --- ShapeUtil ---

export class HtmlPreviewShapeUtil extends BaseBoxShapeUtil<HtmlPreviewShape> {
  static override type = "html-preview" as const;

  static override props = {
    w: T.number,
    h: T.number,
    title: T.string,
    htmlContent: T.string,
  };

  override getDefaultProps(): HtmlPreviewShape["props"] {
    return {
      w: 320,
      h: 240,
      title: "Prototype",
      htmlContent: "",
    };
  }

  override canEdit() {
    return false;
  }

  override canResize() {
    return true;
  }

  component(shape: HtmlPreviewShape) {
    const { title, htmlContent } = shape.props;
    const hasHtml = htmlContent.includes("<");
    const outputId = shape.id.replace(/^shape:/, "");
    const builtSrcDoc = hasHtml
      ? buildCanvasInspectSrcDoc(htmlContent, outputId)
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
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 10,
            border: "1px solid rgba(144,131,255,0.45)",
            boxShadow: "0 0 0 1px rgba(144,131,255,0.12), 0 8px 24px rgba(0,0,0,0.35)",
            background: "#0a0a0a",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {/* Mini browser chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: 28,
              flexShrink: 0,
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "#161616",
              padding: "0 10px",
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: "flex", gap: 4 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.08)",
                }}
              />
            </div>

            {/* URL bar */}
            <div
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.04)",
                borderRadius: 4,
                padding: "2px 8px",
                textAlign: "center",
                fontSize: 9,
                color: "rgba(255,255,255,0.2)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {title}
            </div>

            {/* Built / coded product badge */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 1,
                background: "rgba(144,131,255,0.12)",
                borderRadius: 8,
                padding: "2px 6px",
                border: "1px solid rgba(144,131,255,0.25)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "rgb(167,139,250)",
                    display: "inline-block",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "rgb(196,181,253)",
                    letterSpacing: "0.02em",
                  }}
                >
                  Built
                </span>
              </div>
              <span
                style={{
                  fontSize: 7,
                  fontWeight: 500,
                  color: "rgba(196,181,253,0.65)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Coded
              </span>
            </div>
          </div>

          {/* Content area */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
            }}
          >
            {hasHtml ? (
              <InspectableCanvasIframe
                srcDoc={builtSrcDoc}
                title={title}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "white",
                }}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.2)",
                }}
              >
                HTML preview
              </div>
            )}
          </div>
        </div>
      </HTMLContainer>
    );
  }

  indicator(shape: HtmlPreviewShape) {
    return (
      <rect
        width={shape.props.w}
        height={shape.props.h}
        rx={10}
        ry={10}
      />
    );
  }
}
