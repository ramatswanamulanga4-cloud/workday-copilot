import { createFileRoute } from "@tanstack/react-router";
import type { ModelMessage } from "ai";

const BASE =
  "You are a senior workplace productivity assistant. Be specific, practical and well-structured. Use Markdown headings and bullet points where helpful. Never invent facts; say when information is missing.";

export const Route = createFileRoute("/api/ai")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { streamAi, fetchUrlText } = await import("@/lib/ai.server");
        const body = (await request.json()) as {
          mode: "email" | "research" | "chat";
          tone?: string;
          input?: string;
          url?: string;
          messages?: { role: "user" | "assistant"; content: string }[];
        };
        let instructions = BASE;
        let messages: ModelMessage[] = [];

        if (body.mode === "email") {
          instructions +=
            ` Write a complete professional email in a ${body.tone ?? "Formal"} tone. Start with "Subject: ..." on the first line, then a blank line, then the email body. Output only the email.`;
          messages = [{ role: "user", content: String(body.input ?? "").slice(0, 8000) }];
        } else if (body.mode === "research") {
          let source = String(body.input ?? "").slice(0, 20000);
          let note = "";
          if (body.url) {
            const text = await fetchUrlText(body.url);
            if (text) source += `\n\nContent fetched from ${body.url}:\n${text}`;
            else note = `\n\n(Note: the URL ${body.url} could not be accessed. Tell the user this briefly.)`;
          }
          instructions +=
            " Analyse the material and respond with these Markdown sections: ## Summary, ## Key Findings, ## Insights, ## Actionable Recommendations. If only a topic is given, use general knowledge and flag that it should be verified.";
          messages = [{ role: "user", content: source + note }];
        } else {
          messages = (body.messages ?? []).slice(-20).map((m) => ({
            role: m.role,
            content: String(m.content).slice(0, 8000),
          }));
        }

        const enc = new TextEncoder();
        const stream = new ReadableStream({
          async start(ctrl) {
            try {
              const result = streamAi(request, instructions, messages);
              for await (const part of result.fullStream) {
                if (part.type === "text-delta") ctrl.enqueue(enc.encode(part.text));
                else if (part.type === "error") {
                  const err = part.error as Error;
                  ctrl.enqueue(enc.encode(`\u0000ERROR:${err?.message ?? "AI request failed."}`));
                }
              }
            } catch (e) {
              ctrl.enqueue(enc.encode(`\u0000ERROR:${(e as Error).message}`));
            }
            ctrl.close();
          },
        });
        return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
      },
    },
  },
});
