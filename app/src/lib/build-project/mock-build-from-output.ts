import { nanoid } from "nanoid";
import type { BuildProject, Output, ProjectFile, ProjectRoute } from "@/types";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 32) || "app";
}

function wrapPreviewHtml(title: string, bodyInner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Inter, system-ui, sans-serif; background: #0f0f12; color: #e4e4e7; min-height: 100vh; }
    .wrap { max-width: 720px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 1.5rem; font-weight: 600; margin: 0 0 1rem; color: #fafafa; }
    p { line-height: 1.6; color: #a1a1aa; margin: 0 0 1rem; }
    .card { background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 1.25rem; margin-top: 1rem; }
    a { color: #9083ff; }
  </style>
</head>
<body>
  <div class="wrap">
    ${bodyInner}
  </div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Use the user's prototype HTML as the primary route when possible (no meta “success” screen). */
function primaryPreviewFromSource(source: Output): string {
  const c = source.content.trim();
  if (c.startsWith("<!DOCTYPE") || c.startsWith("<!doctype")) return c;
  if (/^<html[\s>]/i.test(c)) return c;
  if (c.startsWith("<")) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(source.title)}</title>
</head>
<body style="margin:0">${c}</body>
</html>`;
  }
  const summarySnippet =
    source.summary.length > 280
      ? escapeHtml(source.summary.slice(0, 280)) + "…"
      : escapeHtml(source.summary || source.title);
  return wrapPreviewHtml(
    source.title,
    `<main data-figred-component="App" style="padding:1.5rem;">
      <h1 style="margin:0 0 0.75rem;font-size:1.25rem;color:#fafafa;">${escapeHtml(source.title)}</h1>
      <p style="margin:0;color:#a1a1aa;line-height:1.6;">${summarySnippet}</p>
    </main>
    <p style="margin-top:1rem;"><a href="#/checkout">Checkout →</a></p>`
  );
}

/**
 * Deterministic multi-file scaffold + per-route standalone HTML for iframe preview.
 */
export function mockBuildFromOutput(source: Output): BuildProject {
  const projectId = `build-${nanoid(8)}`;
  const name = slugify(source.title);

  const homeHtml = primaryPreviewFromSource(source);

  const checkoutHtml = wrapPreviewHtml(
    `${source.title} — Checkout`,
    `<h1 data-figred-component="CheckoutHeader">Checkout</h1>
    <div class="card" data-figred-component="OrderSummary">
      <p style="margin:0;">Order total: <strong style="color:#fafafa;">$0.00</strong></p>
    </div>
    <p><a href="#/">← Back</a></p>`
  );

  const settingsHtml = wrapPreviewHtml(
    "Settings",
    `<h1 data-figred-component="SettingsTitle">Settings</h1>
    <div class="card"><p style="margin:0;color:#d4d4d8;">Account and preferences</p></div>`
  );

  const globalsCss = `:root {
  --primary: #9083ff;
  --bg: #0f0f12;
  --card: #18181b;
}
body { background: var(--bg); }
`;

  const files: ProjectFile[] = [
    {
      id: `f-${nanoid(6)}`,
      path: "package.json",
      name: "package.json",
      language: "json",
      content: JSON.stringify(
        {
          name,
          private: true,
          version: "0.1.0",
          dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
        },
        null,
        2
      ),
    },
    {
      id: `f-${nanoid(6)}`,
      path: "tsconfig.json",
      name: "tsconfig.json",
      language: "json",
      content: JSON.stringify(
        {
          compilerOptions: {
            jsx: "react-jsx",
            module: "ESNext",
            target: "ES2022",
            strict: true,
          },
        },
        null,
        2
      ),
    },
    {
      id: `f-${nanoid(6)}`,
      path: "src/styles/globals.css",
      name: "globals.css",
      language: "css",
      content: globalsCss,
    },
    {
      id: `f-${nanoid(6)}`,
      path: "src/App.tsx",
      name: "App.tsx",
      language: "tsx",
      content: `import { HomePage } from "./pages/Home";

export default function App() {
  return <HomePage title="${source.title.replace(/"/g, '\\"')}" />;
}
`,
    },
    {
      id: `f-${nanoid(6)}`,
      path: "src/pages/Home.tsx",
      name: "Home.tsx",
      language: "tsx",
      content: `import { Header } from "../components/Header";

export function HomePage({ title }: { title: string }) {
  return (
    <main className="container">
      <Header />
      <h1>{title}</h1>
    </main>
  );
}
`,
    },
    {
      id: `f-${nanoid(6)}`,
      path: "src/pages/Checkout.tsx",
      name: "Checkout.tsx",
      language: "tsx",
      content: `export default function CheckoutPage() {
  return (
    <div className="container mx-auto p-6">
      <h1>Checkout</h1>
      <p>Review your order and pay.</p>
    </div>
  );
}
`,
    },
    {
      id: `f-${nanoid(6)}`,
      path: "src/pages/Settings.tsx",
      name: "Settings.tsx",
      language: "tsx",
      content: `export default function SettingsPage() {
  return <div className="p-6"><h1>Settings</h1></div>;
}
`,
    },
    {
      id: `f-${nanoid(6)}`,
      path: "src/components/Header.tsx",
      name: "Header.tsx",
      language: "tsx",
      content: `export function Header() {
  return (
    <header style={{ padding: "1rem 0", borderBottom: "1px solid #27272a" }}>
      <span style={{ fontWeight: 600 }}>Figred</span>
    </header>
  );
}
`,
    },
  ];

  const routes: ProjectRoute[] = [
    { path: "/", label: "Home", filePath: "src/pages/Home.tsx", previewHtml: homeHtml },
    {
      path: "/checkout",
      label: "Checkout",
      filePath: "src/pages/Checkout.tsx",
      previewHtml: checkoutHtml,
    },
    {
      path: "/settings",
      label: "Settings",
      filePath: "src/pages/Settings.tsx",
      previewHtml: settingsHtml,
    },
  ];

  return {
    id: projectId,
    outputId: source.id,
    name,
    framework: "react",
    files,
    routes,
    dependencies: { react: "^19.0.0", "react-dom": "^19.0.0" },
    entryFile: "src/App.tsx",
  };
}
