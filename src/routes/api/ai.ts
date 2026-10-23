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

        try {
          const result = streamAi(request, instructions, messages);
          return result.toTextStreamResponse();
        } catch (e) {
          return Response.json({ error: (e as Error).message }, { status: 500 });
        }
      },
    },
  },
});
