import { NextRequest } from "next/server";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You describe product UI screens for engineers to rebuild.

First read the product context below — note product, audience, voice, components, and terminology. The screen belongs to *this* product, not a generic one.

Then describe the screen, using product language wherever possible:

1. **Purpose** — one sentence in product terms.
2. **Layout** — top-to-bottom regions and what each does.
3. **Components & states** — named components, variants, visible states.
4. **Copy** — exact strings for headings, labels, CTAs.
5. **Visual cues** — color/spacing/elevation only when they carry meaning.
6. **Open questions** — ambiguities a designer should resolve.

Rules:
- Bullets over paragraphs. No filler.
- Use the product's own terms when they apply; avoid generic UI jargon.
- Don't speculate beyond visible cues.
- If the image isn't a UI screen, say so in one line and stop.`;

type DescribePayload = {
  mode: "image" | "figma-link";
  imageBase64?: string;
  imageMimeType?: string;
  figmaUrl?: string;
  fileName?: string;
  frameName?: string;
  productContext: string;
  userHint?: string;
  spaceName?: string;
  contextItemNames?: string[];
};

function sseFrame(text: string): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`);
}
const SSE_DONE = new TextEncoder().encode(`event: done\ndata: {}\n\n`);
const SSE_ERROR = (msg: string) =>
  new TextEncoder().encode(
    `event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`
  );

export async function POST(req: NextRequest) {
  let body: DescribePayload;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (body.mode === "figma-link") {
    return streamMock(body);
  }
  if (body.mode === "image") {
    return streamImage(body);
  }
  return new Response("Unknown mode", { status: 400 });
}

// ---------- Mock (Figma link) path ----------

function buildMockText(p: DescribePayload): string {
  const fileName = p.fileName ?? "the linked Figma file";
  const frameName = p.frameName ?? "selected frame";
  const space = p.spaceName ?? "this Space";
  const ctxNames = (p.contextItemNames ?? []).slice(0, 2);
  const ctxLine =
    ctxNames.length > 0
      ? `, with attached: ${ctxNames.join(", ")}`
      : "";

  return `> _Mock output — Figma MCP isn't connected yet. This is what a real describer call would produce, populated from your Space's context._

**Reading** ${fileName} · ${frameName} against this Space's context — ${space}${ctxLine}.

1. **Purpose** — Inferred from the frame name and Space description; the real describer would replace this with a one-sentence product-grounded purpose.
2. **Layout** — Header / hero / primary action region / supporting content / footer (placeholder structure — real describer reads actual frame).
3. **Components & states** — primary CTA, form group, and any domain-specific components from the Space's connected design system.
4. **Copy** — _(not visible without Figma MCP read — connect Figma to populate exact strings.)_
5. **Visual cues** — _(deferred to real read.)_
6. **Open questions** — Confirm component variants, copy, and any conditional states with the source frame once Figma MCP is wired.`;
}

function streamMock(payload: DescribePayload): Response {
  const text = buildMockText(payload);
  const stream = new ReadableStream({
    async start(controller) {
      // Stream in small word-ish chunks for visual parity with the real call
      const chunks = text.split(/(\s+)/);
      for (const chunk of chunks) {
        controller.enqueue(sseFrame(chunk));
        await new Promise((r) => setTimeout(r, 18));
      }
      controller.enqueue(SSE_DONE);
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

// ---------- Real (image) path via Gemini ----------

function stripDataUrlPrefix(b64: string): { data: string; mime: string | null } {
  const m = b64.match(/^data:([^;]+);base64,(.*)$/);
  if (m) return { data: m[2], mime: m[1] };
  return { data: b64, mime: null };
}

function streamImage(payload: DescribePayload): Response {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!apiKey) {
    return new Response("GEMINI_API_KEY not configured", { status: 500 });
  }
  if (!payload.imageBase64) {
    return new Response("imageBase64 required for image mode", { status: 400 });
  }

  const { data: imageData, mime: detectedMime } = stripDataUrlPrefix(
    payload.imageBase64
  );
  const mimeType = payload.imageMimeType || detectedMime || "image/png";

  const userText = `PRODUCT CONTEXT:\n${payload.productContext}\n\n---\n${
    payload.userHint ? `User hint: ${payload.userHint}\n\n` : ""
  }Describe the attached screen following the rules above.`;

  const geminiBody = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: "user",
        parts: [
          { text: userText },
          { inline_data: { mime_type: mimeType, data: imageData } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  const stream = new ReadableStream({
    async start(controller) {
      let geminiRes: Response;
      try {
        geminiRes = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geminiBody),
        });
      } catch (err) {
        controller.enqueue(SSE_ERROR(`Gemini fetch failed: ${String(err)}`));
        controller.close();
        return;
      }

      if (!geminiRes.ok || !geminiRes.body) {
        const errText = await geminiRes.text().catch(() => "");
        controller.enqueue(
          SSE_ERROR(`Gemini ${geminiRes.status}: ${errText.slice(0, 500)}`)
        );
        controller.close();
        return;
      }

      const reader = geminiRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE events are separated by \n\n
          let idx;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const eventBlock = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            const dataLine = eventBlock
              .split("\n")
              .find((l) => l.startsWith("data:"));
            if (!dataLine) continue;
            const json = dataLine.slice(5).trim();
            if (!json || json === "[DONE]") continue;
            try {
              const obj = JSON.parse(json);
              const text =
                obj?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              if (text) controller.enqueue(sseFrame(text));
            } catch {
              /* skip malformed event */
            }
          }
        }
        controller.enqueue(SSE_DONE);
      } catch (err) {
        controller.enqueue(SSE_ERROR(`Stream read failed: ${String(err)}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
