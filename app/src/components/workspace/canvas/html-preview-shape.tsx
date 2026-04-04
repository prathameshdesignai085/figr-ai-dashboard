import {
  BaseBoxShapeUtil,
  HTMLContainer,
  T,
  TLBaseShape,
} from "tldraw";

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
            border: "1px solid rgba(255,255,255,0.08)",
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

            {/* Live badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "rgba(34,197,94,0.1)",
                borderRadius: 10,
                padding: "2px 6px",
              }}
            >
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "rgb(74,222,128)",
                  display: "inline-block",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              />
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: "rgb(74,222,128)",
                }}
              >
                Live
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
              <iframe
                srcDoc={htmlContent}
                sandbox="allow-scripts"
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  background: "white",
                }}
                title={title}
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
