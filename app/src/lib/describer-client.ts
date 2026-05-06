export type DescribeRequest =
  | {
      mode: "image";
      imageBase64: string;
      imageMimeType: string;
      productContext: string;
      userHint?: string;
    }
  | {
      mode: "figma-link";
      figmaUrl: string;
      fileName?: string;
      frameName?: string;
      productContext: string;
      userHint?: string;
      spaceName?: string;
      contextItemNames?: string[];
    };

export type DescribeCallbacks = {
  onChunk: (text: string) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
};

/**
 * POST to /api/describe and consume the SSE stream.
 * Each `data:` event is JSON `{ "text": "<chunk>" }`.
 * `event: done` ends the stream; `event: error` carries `{ message }`.
 */
export async function streamDescribe(
  payload: DescribeRequest,
  cb: DescribeCallbacks,
  signal?: AbortSignal
): Promise<void> {
  return streamSseRoute("/api/describe", payload, cb, signal);
}

/**
 * Generator-style skill request body. The client builds the user-message
 * text from local stores (Space, captures, knowledge) and posts it; the
 * server just orchestrates the Gemini call with the right system prompt.
 */
export type SkillRequest = {
  contextText: string;
  images?: { mime: string; base64: string }[];
};

export async function streamSkill(
  skillId: string,
  payload: SkillRequest,
  cb: DescribeCallbacks,
  signal?: AbortSignal
): Promise<void> {
  return streamSseRoute(
    `/api/skill/${encodeURIComponent(skillId)}`,
    payload,
    cb,
    signal
  );
}

/** Shared SSE consumer. Both /api/describe and /api/skill/[name] use the
 * same wire format: `data:` chunks with JSON `{text}`, `event: done`, and
 * `event: error` with `{message}`. */
async function streamSseRoute(
  url: string,
  payload: unknown,
  cb: DescribeCallbacks,
  signal?: AbortSignal
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    cb.onError?.(`Network error: ${String(err)}`);
    return;
  }

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    cb.onError?.(`Server error ${res.status}: ${text.slice(0, 300)}`);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "message";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx;
      while ((idx = buffer.indexOf("\n\n")) !== -1) {
        const block = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        currentEvent = "message";
        const lines = block.split("\n");
        let dataPayload = "";
        for (const line of lines) {
          if (line.startsWith("event:")) currentEvent = line.slice(6).trim();
          else if (line.startsWith("data:"))
            dataPayload += line.slice(5).trim();
        }
        if (!dataPayload) continue;
        if (currentEvent === "error") {
          try {
            const obj = JSON.parse(dataPayload);
            cb.onError?.(obj.message ?? "Unknown error");
          } catch {
            cb.onError?.(dataPayload);
          }
          return;
        }
        if (currentEvent === "done") {
          cb.onDone?.();
          return;
        }
        try {
          const obj = JSON.parse(dataPayload);
          if (typeof obj.text === "string") cb.onChunk(obj.text);
        } catch {
          /* skip */
        }
      }
    }
    cb.onDone?.();
  } catch (err) {
    cb.onError?.(`Stream interrupted: ${String(err)}`);
  }
}
