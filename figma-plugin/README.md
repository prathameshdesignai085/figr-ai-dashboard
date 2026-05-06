# Figred Handover — Figma plugin

The plugin pairs with a Figred webapp instance, pulls a published handover bundle, and lays out the captured screen states as a labeled Section in the user's open Figma file.

## Dev setup

```bash
cd figma-plugin
npm install
npm run build       # one-shot build
# or
npm run watch       # rebuild on change
```

## Loading in Figma Desktop

> **Figma Desktop is required** for development plugins. Figma in browser cannot import a local manifest.

1. Open **Figma Desktop**.
2. Open any file (a blank scratch file is fine).
3. Menu: **Plugins → Development → Import plugin from manifest…**
4. Pick `figma-plugin/manifest.json`.
5. Run via **Plugins → Development → Figred Handover**.

## Pairing flow

1. In Figred web (`http://localhost:3000`), open a Space and capture some prototype states.
2. Click **Publish handover** → expand "Push to Figma plugin" → "Get pair code".
3. In the plugin window: paste the 6-char code, click **Pair**.
4. Click **Publish v1** in the modal. Bundle is queued on the server keyed by your sessionToken.
5. Switch to Figma → click **Pull latest handover** in the plugin. The Section materializes.

## File layout

```
figma-plugin/
├── manifest.json    # Figma plugin spec — networkAccess, main, ui, editorType
├── package.json     # local deps: esbuild, plugin-typings
├── build.mjs        # esbuild build script (run via npm run build / watch)
├── tsconfig.json    # strict TS, plugin-typings lib
├── src/
│   ├── code.ts      # main thread — figma.* API, builds the Section
│   ├── ui.html      # iframe shell
│   ├── ui.ts        # iframe UI — fetch, pair input, pull button
│   └── shared.ts    # message types shared between code and ui
└── dist/            # built output (gitignored)
```

## Production deploy

When deploying Figred to a real domain, update `manifest.json`'s `allowedDomains` to include the deployed hostname, and update the `FIGRED_BASE` constant in `src/ui.ts` (or read from a build-time env var).
