import { createOpenAI } from "@ai-sdk/openai";
import { streamText, type ModelMessage } from "ai";

const RUN = "X-Lovable-AIG-Run-ID";

export function streamAi(request: Request, instructions: string, messages: ModelMessage[]) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured (missing key).");
  let runId: string | undefined;
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: async (input, init) => {
      const headers = new Headers(init?.headers);
      if (runId) headers.set(RUN, runId);
      const res = await fetch(input, { ...init, headers, signal: init?.signal ?? null });
      runId ??= res.headers.get(RUN) ?? undefined;
      if (!res.ok) {
        const body = await res.clone().text().catch(() => "");
        throw new AiHttpError(res.status, body);
      }
      return res;
    },
  });
  return streamText({
    model: provider.responses("openai/gpt-6-astra"),
    instructions,
    messages,
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        include: ["reasoning.encrypted_content"],
      },
    },
  });
}

export class AiHttpError extends Error {
  constructor(public status: number, body: string) {
    let msg = "The AI service returned an error.";
    try {
      const j = JSON.parse(body);
      msg = j?.error?.message || j?.message || msg;
    } catch {}
    if (status === 429) msg = "Too many requests right now. Please wait a moment and try again.";
    if (status === 402) msg = "The free AI allowance for this workspace is used up. " + msg;
    super(msg);
  }
}

export async function fetchUrlText(url: string): Promise<string | null> {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return null;
    const res = await fetch(u, { headers: { "User-Agent": "Mozilla/5.0 WorkplaceAssistant" } });
    if (!res.ok) return null;
    const html = await res.text();
    return html
      .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 20000);
  } catch {
    return null;
  }
}
