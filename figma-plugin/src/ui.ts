import type {
  CodeToUiMessage,
  HandoverBundle,
  UiToCodeMessage,
} from "./shared";

const FIGRED_BASE = "http://localhost:3000";

let sessionToken: string | null = null;
let lastPullAt: string | null = null;

const root = document.getElementById("root") as HTMLDivElement;

function send(msg: UiToCodeMessage) {
  parent.postMessage({ pluginMessage: msg }, "*");
}

window.onmessage = (event: MessageEvent) => {
  const msg = (event.data?.pluginMessage as CodeToUiMessage | undefined) ?? null;
  if (!msg) return;

  if (msg.kind === "init") {
    sessionToken = msg.sessionToken;
    lastPullAt = msg.lastPullAt;
    render();
    return;
  }

  if (msg.kind === "section-created") {
    lastPullAt = msg.lastPullAt;
    if (msg.sectionUrl && sessionToken) {
      // Tell Figred the section URL so the public handover page updates.
      void fetch(`${FIGRED_BASE}/api/figma/section-created`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          slug: msg.slug,
          sectionUrl: msg.sectionUrl,
        }),
      }).catch(() => {});
    }
    render();
    setMessage("pull-msg", "Section built — check the canvas.", "success");
    return;
  }

  if (msg.kind === "section-error") {
    setMessage("pull-msg", `Couldn't build section: ${msg.message}`, "error");
    return;
  }
};

async function pair(code: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${FIGRED_BASE}/api/pair/claim`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    });
    if (res.status === 404) {
      return { ok: false, error: "Code not found or already used. Get a fresh one in Figred." };
    }
    if (!res.ok) {
      return { ok: false, error: `Server error ${res.status}` };
    }
    const data = (await res.json()) as { sessionToken?: string };
    if (typeof data.sessionToken !== "string") {
      return { ok: false, error: "Bad response from Figred." };
    }
    sessionToken = data.sessionToken;
    send({ kind: "save-token", token: sessionToken });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: `Network error — is Figred running at ${FIGRED_BASE}? (${String(e)})`,
    };
  }
}

async function pull(): Promise<{ ok: boolean; error?: string }> {
  if (!sessionToken) return { ok: false, error: "Not paired." };
  try {
    const res = await fetch(
      `${FIGRED_BASE}/api/figma/pull?token=${encodeURIComponent(sessionToken)}`,
      { method: "POST" }
    );
    if (res.status === 204) {
      return {
        ok: false,
        error: "No new handovers — publish from Figred first, with 'Push to Figma' on.",
      };
    }
    if (!res.ok) return { ok: false, error: `Server error ${res.status}` };
    const data = (await res.json()) as {
      bundle: HandoverBundle;
      slug: string;
      bundleStatesCount?: number;
    };
    console.log(
      `[plugin-ui] /api/figma/pull responded slug=${data.slug} bundleStatesCount=${data.bundleStatesCount} bundle.states.length=${data.bundle?.states?.length}`
    );
    send({ kind: "build-section", bundle: data.bundle });
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: `Network error: ${String(e)}`,
    };
  }
}

function unpair() {
  sessionToken = null;
  lastPullAt = null;
  send({ kind: "clear-token" });
  render();
}

function setMessage(id: string, text: string, kind: "info" | "error" | "success" | "" = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = kind ? `msg ${kind}` : "msg";
}

function render() {
  if (!sessionToken) renderPair();
  else renderPaired();
}

function renderPair() {
  root.innerHTML = `
    <div class="stack">
      <div class="title">Connect to Figred</div>
      <div class="hint">Paste the pair code shown in your Figred publish modal.</div>
      <input id="code" type="text" maxlength="6" autocomplete="off" placeholder="ABCD12" aria-label="Pair code" />
      <button id="pair-btn" class="primary">Pair</button>
      <div id="pair-msg" class="msg"></div>
    </div>
  `;
  const code = document.getElementById("code") as HTMLInputElement;
  const btn = document.getElementById("pair-btn") as HTMLButtonElement;

  code.focus();
  code.addEventListener("input", () => {
    code.value = code.value.toUpperCase();
  });
  code.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btn.click();
  });
  btn.addEventListener("click", async () => {
    if (code.value.trim().length < 4) {
      setMessage("pair-msg", "Enter the 6-character code.", "error");
      return;
    }
    btn.disabled = true;
    btn.textContent = "Pairing…";
    setMessage("pair-msg", "", "");
    const result = await pair(code.value);
    btn.disabled = false;
    btn.textContent = "Pair";
    if (!result.ok) {
      setMessage("pair-msg", result.error || "Failed.", "error");
      return;
    }
    setMessage("pair-msg", "Paired! Loading…", "success");
    setTimeout(render, 350);
  });
}

function renderPaired() {
  const ts = lastPullAt
    ? new Date(lastPullAt).toLocaleString()
    : "never";
  root.innerHTML = `
    <div class="stack">
      <div class="title">
        <span class="dot"></span>
        Connected to Figred
      </div>
      <div class="hint">Last pull: ${escapeHtml(ts)}</div>
      <button id="pull-btn" class="primary">Pull latest handover</button>
      <div id="pull-msg" class="msg"></div>
      <div class="footer">
        <button id="unpair-btn" class="link">Unpair</button>
      </div>
    </div>
  `;
  const btn = document.getElementById("pull-btn") as HTMLButtonElement;
  const unpairBtn = document.getElementById("unpair-btn") as HTMLButtonElement;

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Pulling…";
    setMessage("pull-msg", "", "");
    const result = await pull();
    btn.disabled = false;
    btn.textContent = "Pull latest handover";
    if (!result.ok) {
      setMessage("pull-msg", result.error || "Failed.", "error");
      return;
    }
    setMessage("pull-msg", "Building section in Figma…", "info");
  });

  unpairBtn.addEventListener("click", () => {
    if (
      confirm("Unpair from Figred? You'll need to re-enter a pair code next time.")
    ) {
      unpair();
    }
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

render();
