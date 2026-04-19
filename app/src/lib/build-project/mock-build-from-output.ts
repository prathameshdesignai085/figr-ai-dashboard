import { nanoid } from "nanoid";
import type { BuildProject, Output, ProjectFile, ProjectRoute, TargetPlatform } from "@/types";

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
 * Phone-shell wrapper — frames any inner body in a centered iPhone-ish device.
 * Used for the *mobile* mock-build path so the iframe preview matches what the
 * On Device tab will render via Snack.
 */
function wrapMobileShell(title: string, bodyInner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Inter", sans-serif; background: #fafafa; color: #18181b; }
    .stage { min-height: 100%; display: flex; align-items: center; justify-content: center; padding: 16px; background: linear-gradient(180deg, #0a0a0a, #18181b); }
    .device { width: 360px; height: 720px; background: #ffffff; border-radius: 36px; border: 10px solid #0a0a0a; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.5); display: flex; flex-direction: column; position: relative; }
    .island { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 96px; height: 24px; border-radius: 999px; background: #0a0a0a; z-index: 5; }
    .home { position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); width: 110px; height: 4px; border-radius: 999px; background: rgba(0,0,0,0.25); z-index: 5; }
    .statusbar { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px 8px; font-size: 11px; font-weight: 600; color: #18181b; }
    .content { flex: 1; overflow: auto; padding: 16px; }
    .content h1 { font-size: 20px; margin: 0 0 6px; font-weight: 700; }
    .content p { color: #52525b; margin: 0 0 12px; line-height: 1.5; font-size: 13px; }
    .card { padding: 14px; border: 1px solid #e4e4e7; border-radius: 14px; background: #fafafa; margin-bottom: 8px; }
    .tabbar { display: grid; grid-template-columns: repeat(4,1fr); padding: 8px 0 18px; border-top: 1px solid #e4e4e7; background: #ffffff; font-size: 10px; color: #52525b; }
    .tab { display: flex; flex-direction: column; align-items: center; gap: 2px; }
    .tab .dot { width: 14px; height: 14px; border-radius: 4px; background: #d4d4d8; }
    .tab.active { color: #7c6ef5; }
    .tab.active .dot { background: #7c6ef5; }
    a { color: #7c6ef5; }
  </style>
</head>
<body>
  <div class="stage">
    <div class="device">
      <div class="island"></div>
      <div class="statusbar"><span>9:41</span><span>● ▮ ▮▮</span></div>
      <div class="content">
        ${bodyInner}
      </div>
      <div class="tabbar">
        <div class="tab active"><div class="dot"></div><span>Home</span></div>
        <div class="tab"><div class="dot"></div><span>Search</span></div>
        <div class="tab"><div class="dot"></div><span>Activity</span></div>
        <div class="tab"><div class="dot"></div><span>Profile</span></div>
      </div>
      <div class="home"></div>
    </div>
  </div>
</body>
</html>`;
}

function mobilePrimaryPreviewFromSource(source: Output): string {
  const summary =
    source.summary.length > 240
      ? escapeHtml(source.summary.slice(0, 240)) + "…"
      : escapeHtml(source.summary || source.title);
  return wrapMobileShell(
    source.title,
    `<h1 data-figred-component="ScreenTitle">${escapeHtml(source.title)}</h1>
    <p>${summary}</p>
    <div class="card" data-figred-component="PrimaryCard">
      <div style="font-weight:600;font-size:13px;margin-bottom:4px;">Featured</div>
      <div style="color:#52525b;font-size:12px;">Tap to open</div>
    </div>
    <div class="card"><div style="font-weight:500;font-size:13px;">Recent activity</div></div>
    <div class="card"><div style="font-weight:500;font-size:13px;">Suggestions</div></div>`
  );
}

/** Minimal Expo Snack RN source — used when targetPlatform is mobile. */
function generateSnackRNSource(source: Output): string {
  const safeTitle = source.title.replace(/[`$]/g, "").slice(0, 60);
  return `import React from 'react';
import { SafeAreaView, View, Text, ScrollView, StyleSheet } from 'react-native';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>${safeTitle}</Text>
        <Text style={styles.body}>Generated by Figred · mock RN scaffold.</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Featured</Text>
          <Text style={styles.cardBody}>Tap to open</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent activity</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Suggestions</Text>
        </View>
      </ScrollView>
      <View style={styles.tabbar}>
        {['Home','Search','Activity','Profile'].map((label, i) => (
          <View key={label} style={styles.tab}>
            <View style={[styles.dot, i === 0 && styles.dotActive]} />
            <Text style={[styles.tabLabel, i === 0 && styles.tabLabelActive]}>{label}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#18181b', marginBottom: 6 },
  body: { color: '#52525b', marginBottom: 16, lineHeight: 20 },
  card: { padding: 14, borderRadius: 14, backgroundColor: '#fafafa', borderWidth: 1, borderColor: '#e4e4e7', marginBottom: 8 },
  cardTitle: { fontWeight: '600', color: '#18181b' },
  cardBody: { color: '#52525b', marginTop: 4 },
  tabbar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#e4e4e7', paddingVertical: 10 },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  dot: { width: 14, height: 14, borderRadius: 4, backgroundColor: '#d4d4d8' },
  dotActive: { backgroundColor: '#7c6ef5' },
  tabLabel: { fontSize: 10, color: '#52525b' },
  tabLabelActive: { color: '#7c6ef5' },
});
`;
}

/**
 * Deterministic multi-file scaffold + per-route standalone HTML for iframe preview.
 */
export function mockBuildFromOutput(source: Output): BuildProject {
  const projectId = `build-${nanoid(8)}`;
  const name = slugify(source.title);
  const platform: TargetPlatform =
    source.platform === "mobile" ? "mobile" : "web";
  const isMobile = platform === "mobile";

  const homeHtml = isMobile
    ? mobilePrimaryPreviewFromSource(source)
    : primaryPreviewFromSource(source);

  const wrap = isMobile ? wrapMobileShell : wrapPreviewHtml;
  const checkoutHtml = wrap(
    `${source.title} — Checkout`,
    `<h1 data-figred-component="CheckoutHeader">Checkout</h1>
    <div class="card" data-figred-component="OrderSummary">
      <p style="margin:0;">Order total: <strong style="color:#18181b;">$0.00</strong></p>
    </div>
    <p><a href="#/">← Back</a></p>`
  );

  const settingsHtml = wrap(
    "Settings",
    `<h1 data-figred-component="SettingsTitle">Settings</h1>
    <div class="card"><p style="margin:0;color:#52525b;">Account and preferences</p></div>`
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
    framework: isMobile ? "expo" : "react",
    files,
    routes,
    dependencies: isMobile
      ? { expo: "~52.0.0", react: "19.0.0", "react-native": "0.76.0" }
      : { react: "^19.0.0", "react-dom": "^19.0.0" },
    entryFile: isMobile ? "App.tsx" : "src/App.tsx",
    targetPlatform: platform,
    snackSource: isMobile ? generateSnackRNSource(source) : undefined,
  };
}
