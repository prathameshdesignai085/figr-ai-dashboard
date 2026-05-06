import * as esbuild from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const watch = process.argv.includes("--watch");

await mkdir("dist", { recursive: true });

/** @type {import("esbuild").BuildOptions} */
const codeOpts = {
  entryPoints: ["src/code.ts"],
  bundle: true,
  outfile: "dist/code.js",
  target: "es2017",
  platform: "browser",
  format: "iife",
  logLevel: "info",
};

/**
 * Build ui.ts → JS string in memory, then inline it into ui.html.
 * Figma's plugin sandbox doesn't load external scripts — the UI HTML must
 * carry its JS inline.
 */
async function buildAndInlineUi() {
  const result = await esbuild.build({
    entryPoints: ["src/ui.ts"],
    bundle: true,
    write: false,
    target: "es2017",
    platform: "browser",
    format: "iife",
    logLevel: "info",
  });
  const jsBytes = result.outputFiles?.[0]?.contents;
  if (!jsBytes) throw new Error("ui.ts build produced no output");
  const js = new TextDecoder().decode(jsBytes);

  const htmlTemplate = await readFile("src/ui.html", "utf8");
  const inlined = htmlTemplate.replace(
    /<script\s+src="\.\/ui\.js"><\/script>/,
    `<script>${js}</script>`
  );
  if (inlined === htmlTemplate) {
    throw new Error(
      "Couldn't find <script src=\"./ui.js\"></script> in src/ui.html — bail."
    );
  }
  await writeFile("dist/ui.html", inlined, "utf8");
  console.log(`dist/ui.html  ${(inlined.length / 1024).toFixed(1)}kb (inlined)`);
}

if (watch) {
  const codeCtx = await esbuild.context(codeOpts);
  await codeCtx.watch();
  // Re-run UI build on every poll. esbuild watch context is per-config; for
  // the inlined HTML we just rebuild on a 500ms interval — simpler than
  // wiring a chokidar watcher for one file.
  await buildAndInlineUi();
  setInterval(() => {
    buildAndInlineUi().catch((e) => console.error("ui rebuild failed:", e));
  }, 800);
  console.log("Watching for changes…");
} else {
  await Promise.all([esbuild.build(codeOpts), buildAndInlineUi()]);
  console.log("Build complete.");
}
