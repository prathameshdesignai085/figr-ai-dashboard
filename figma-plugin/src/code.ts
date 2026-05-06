/// <reference types="@figma/plugin-typings" />
import type {
  CodeToUiMessage,
  HandoverBundle,
  UiToCodeMessage,
} from "./shared";

figma.showUI(__html__, { width: 320, height: 380, themeColors: true });

// Forward initial state from clientStorage to the UI on launch.
(async () => {
  const sessionToken =
    (await figma.clientStorage.getAsync("figred-session-token")) ?? null;
  const lastPullAt =
    (await figma.clientStorage.getAsync("figred-last-pull")) ?? null;
  postToUi({ kind: "init", sessionToken, lastPullAt });
})();

figma.ui.onmessage = async (msg: UiToCodeMessage) => {
  if (msg.kind === "save-token") {
    await figma.clientStorage.setAsync("figred-session-token", msg.token);
    return;
  }
  if (msg.kind === "clear-token") {
    await figma.clientStorage.deleteAsync("figred-session-token");
    return;
  }
  if (msg.kind === "build-section") {
    const count = msg.bundle?.states?.length ?? 0;
    console.log(
      `[plugin] received bundle slug=${msg.bundle?.slug} states=${count}`
    );
    figma.notify(`Pulled ${count} screen${count === 1 ? "" : "s"} — building…`);
    try {
      await buildSection(msg.bundle);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.error("buildSection failed:", message);
      postToUi({ kind: "section-error", message });
      figma.notify(`Couldn't build Figma section: ${message}`, { error: true });
    }
    return;
  }
  if (msg.kind === "notify") {
    figma.notify(msg.message, { error: msg.error });
    return;
  }
};

function postToUi(msg: CodeToUiMessage) {
  figma.ui.postMessage(msg);
}

async function buildSection(bundle: HandoverBundle): Promise<void> {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Semi Bold" });

  // Layout constants.
  const FRAME_SCALE = 0.5; // shrink full-res mocks for tidy canvas size
  const SCREEN_GAP = 24;
  const LABEL_GAP = 10;
  const LABEL_HEIGHT = 18;
  const GROUP_PAD = 32;
  const HEADER_HEIGHT = 32;
  const HEADER_GAP = 24;
  const GROUP_GAP = 32;
  const ROOT_PAD = 60;

  // 1) Group states by `group` field, preserving insertion order.
  const groupOrder: string[] = [];
  const groupMap = new Map<string, typeof bundle.states>();
  for (const s of bundle.states) {
    const key = s.group?.trim() || "Screens";
    if (!groupMap.has(key)) {
      groupOrder.push(key);
      groupMap.set(key, []);
    }
    groupMap.get(key)!.push(s);
  }

  // 2) Pre-load all images and compute scaled sizes so we can size the
  //    container frames before layout.
  type Screen = { name: string; w: number; h: number; image: Image };
  const groups: { name: string; screens: Screen[] }[] = [];
  for (const name of groupOrder) {
    const screens: Screen[] = [];
    for (const state of groupMap.get(name)!) {
      const dataUrlPrefix = (state.dataUrl ?? "").slice(0, 40);
      let bytes: Uint8Array;
      try {
        bytes = base64ToUint8(stripDataUrlPrefix(state.dataUrl));
      } catch (e) {
        console.error(
          `[plugin] base64 decode failed for "${state.name}":`,
          e,
          "prefix=",
          dataUrlPrefix
        );
        continue;
      }
      console.log(
        `[plugin] decoding "${state.name}": dataUrl.length=${state.dataUrl?.length} bytes.length=${bytes.length} prefix=${dataUrlPrefix}`
      );
      const image = figma.createImage(bytes);
      const { width, height } = await image.getSizeAsync();
      console.log(
        `[plugin] image "${state.name}": hash=${image.hash?.slice(0, 12)}… size=${width}×${height}`
      );
      const w = Math.max(1, Math.floor(width * FRAME_SCALE));
      const h = Math.max(1, Math.floor(height * FRAME_SCALE));
      screens.push({ name: state.name, w, h, image });
    }
    if (screens.length > 0) groups.push({ name, screens });
  }

  if (groups.length === 0) {
    figma.notify(
      "Bundle was empty — likely a stale pair token. Unpair on both sides and re-pair from a fresh Figred publish.",
      { error: true, timeout: 8000 }
    );
    return;
  }

  // 3) Compute size of each group's container frame.
  const groupSizes = groups.map((g) => {
    let totalW = 0;
    let maxH = 0;
    for (const s of g.screens) {
      totalW += s.w + SCREEN_GAP;
      maxH = Math.max(maxH, s.h);
    }
    totalW -= SCREEN_GAP; // remove last gap
    return {
      width: totalW + GROUP_PAD * 2,
      height:
        GROUP_PAD +
        HEADER_HEIGHT +
        HEADER_GAP +
        maxH +
        LABEL_GAP +
        LABEL_HEIGHT +
        GROUP_PAD,
    };
  });
  const maxGroupW = Math.max(...groupSizes.map((s) => s.width));
  const totalContentH =
    groupSizes.reduce((sum, sz) => sum + sz.height + GROUP_GAP, 0) - GROUP_GAP;

  // 4) Root: ONE section as the outer wrapper (the "folder").
  const rootW = maxGroupW + ROOT_PAD * 2;
  const rootH = totalContentH + ROOT_PAD * 2 + 60; // +60 for the title

  const root = figma.createSection();
  root.name = bundle.sectionName || "Handover";
  root.resizeWithoutConstraints(rootW, rootH);
  // Position somewhere visible relative to the viewport.
  const cx = figma.viewport.center.x;
  const cy = figma.viewport.center.y;
  root.x = Math.round(cx - rootW / 2);
  root.y = Math.round(cy - rootH / 2);

  // Title text (top of section)
  const title = figma.createText();
  title.fontName = { family: "Inter", style: "Semi Bold" };
  title.characters = bundle.sectionName || "Handover";
  title.fontSize = 28;
  title.fills = [{ type: "SOLID", color: { r: 0.05, g: 0.05, b: 0.1 } }];
  // Position absolutely on the page (sections keep child coords absolute).
  title.x = root.x + ROOT_PAD;
  title.y = root.y + ROOT_PAD;
  root.appendChild(title);

  // 5) For each group: create a FRAME (not nested section) holding the
  //    header + screens. Frames reliably contain children in the layer tree.
  let absY = root.y + ROOT_PAD + 60; // 60px below title baseline
  const absX = root.x + ROOT_PAD;

  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    const gz = groupSizes[gi];

    // Parent the group frame to the root section FIRST so its children
    // attach into a node that already lives in the tree. Helps Figma keep
    // the section/frame containment consistent.
    const groupFrame = figma.createFrame();
    root.appendChild(groupFrame);
    groupFrame.fills = [
      { type: "SOLID", color: { r: 0.97, g: 0.97, b: 0.985 } },
    ];
    groupFrame.cornerRadius = 16;
    groupFrame.resize(gz.width, gz.height);
    groupFrame.x = absX;
    groupFrame.y = absY;
    groupFrame.name = g.name;
    groupFrame.clipsContent = false; // let nested frames stay visible

    // Group header — child of groupFrame, so coords are relative.
    const header = figma.createText();
    header.fontName = { family: "Inter", style: "Semi Bold" };
    header.characters = g.name;
    header.fontSize = 20;
    header.fills = [{ type: "SOLID", color: { r: 0.1, g: 0.1, b: 0.15 } }];
    groupFrame.appendChild(header);
    header.x = GROUP_PAD;
    header.y = GROUP_PAD;

    // Screens
    let cursorRelX = GROUP_PAD;
    const screenY = GROUP_PAD + HEADER_HEIGHT + HEADER_GAP;
    for (const s of g.screens) {
      // Create + parent FIRST. Figma sometimes drops fills set before the
      // node is attached to the document tree.
      const imgFrame = figma.createFrame();
      groupFrame.appendChild(imgFrame);

      // Now resize + fill + position the now-attached frame.
      imgFrame.resize(s.w, s.h);
      imgFrame.x = cursorRelX;
      imgFrame.y = screenY;
      imgFrame.clipsContent = true;
      imgFrame.cornerRadius = 12;
      imgFrame.fills = [
        { type: "IMAGE", scaleMode: "FILL", imageHash: s.image.hash },
      ];
      imgFrame.strokes = [
        { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.06 },
      ];
      imgFrame.strokeWeight = 1;
      // Set name AFTER fills — Figma auto-renames image-filled frames to
      // "image N" the moment the fill is applied.
      imgFrame.name = s.name;

      console.log(
        `[plugin] placed frame "${s.name}" at (${imgFrame.x}, ${imgFrame.y}) ${imgFrame.width}×${imgFrame.height} fillType=${(imgFrame.fills as readonly Paint[])[0]?.type} hashOnFill=${(imgFrame.fills as readonly ImagePaint[])[0]?.imageHash?.slice(0, 12)}…`
      );

      const label = figma.createText();
      groupFrame.appendChild(label);
      label.fontName = { family: "Inter", style: "Regular" };
      label.characters = s.name;
      label.fontSize = 12;
      label.fills = [{ type: "SOLID", color: { r: 0.4, g: 0.4, b: 0.45 } }];
      label.x = cursorRelX;
      label.y = screenY + s.h + LABEL_GAP;

      cursorRelX += s.w + SCREEN_GAP;
    }

    // groupFrame was already appended to root at the top of the loop.
    absY += gz.height + GROUP_GAP;
  }

  figma.viewport.scrollAndZoomIntoView([root]);

  const now = new Date().toISOString();
  await figma.clientStorage.setAsync("figred-last-pull", now);

  const fileKey = (figma as unknown as { fileKey?: string }).fileKey ?? null;
  const sectionUrl = fileKey
    ? `https://www.figma.com/design/${fileKey}/?node-id=${encodeURIComponent(
        root.id
      )}`
    : null;

  postToUi({
    kind: "section-created",
    sectionId: root.id,
    sectionUrl,
    slug: bundle.slug,
    lastPullAt: now,
  });

  const totalScreens = groups.reduce((n, g) => n + g.screens.length, 0);
  figma.notify(
    `Built ${groups.length} group${groups.length === 1 ? "" : "s"} with ${totalScreens} screen${totalScreens === 1 ? "" : "s"}.`
  );
}

function stripDataUrlPrefix(s: string): string {
  const m = s.match(/^data:[^;]+;base64,(.*)$/);
  return m ? m[1] : s;
}

function base64ToUint8(b64: string): Uint8Array {
  // Plugin sandbox provides atob.
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
