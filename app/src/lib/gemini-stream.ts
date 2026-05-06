import "server-only";

/**
 * Shared SSE-streaming helper for Gemini calls. Used by /api/skill/[name].
 * Wire format on the response is the same shape /api/describe uses today:
 *   data: {"text":"…"}\n\n   for each chunk
 *   event: done\ndata: {}\n\n on completion
 *   event: error\ndata: {"message":"…"}\n\n on failure
 *
 * Both text-only and multimodal calls go through here. Multimodal callers
 * pass `images` (each with mime + base64 — `data:` prefix is stripped).
 */

type GeminiImage = { mime: string; base64: string };

export type GeminiStreamArgs = {
  systemPrompt: string;
  userText: string;
  images?: GeminiImage[];
  model?: string;
  /** 0–1. Defaults to 0.4 — same as /figma-describe. */
  temperature?: number;
};

const ENC = new TextEncoder();
const SSE_DONE = ENC.encode(`event: done\ndata: {}\n\n`);
const sseFrame = (text: string): Uint8Array =>
  ENC.encode(`data: ${JSON.stringify({ text })}\n\n`);
const sseError = (message: string): Uint8Array =>
  ENC.encode(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);

const SSE_HEADERS = {
  "Content-Type": "text/event-stream; charset=utf-8",
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
};

function stripDataUrlPrefix(b64: string): string {
  const m = b64.match(/^data:[^;]+;base64,(.*)$/);
  return m ? m[1] : b64;
}

/**
 * Returns a Response that streams Gemini output back to the client as SSE.
 * Errors are written to the same stream as `event: error` frames so the
 * client gets a clean `onError` callback regardless of where the failure
 * originated (network, API, parse).
 */
export function streamGeminiSSE(args: GeminiStreamArgs): Response {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = args.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    // Fail fast with a one-shot SSE error — keeps the client error path uniform.
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(sseError("GEMINI_API_KEY not configured"));
        controller.close();
      },
    });
    return new Response(stream, { headers: SSE_HEADERS });
  }

  const parts: Array<
    { text: string } | { inline_data: { mime_type: string; data: string } }
  > = [{ text: args.userText }];
  for (const img of args.images ?? []) {
    parts.push({
      inline_data: {
        mime_type: img.mime,
        data: stripDataUrlPrefix(img.base64),
      },
    });
  }

  const body = {
    system_instruction: { parts: [{ text: args.systemPrompt }] },
    contents: [{ role: "user", parts }],
    generationConfig: { temperature: args.temperature ?? 0.4 },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`;

  const stream = new ReadableStream({
    async start(controller) {
      let res: Response;
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } catch (err) {
        controller.enqueue(sseError(`Gemini fetch failed: ${String(err)}`));
        controller.close();
        return;
      }

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        controller.enqueue(
          sseError(`Gemini ${res.status}: ${errText.slice(0, 500)}`)
        );
        controller.close();
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

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
        controller.enqueue(sseError(`Stream read failed: ${String(err)}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
