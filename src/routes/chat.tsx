import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Bot, Trash2 } from "lucide-react";
import { AppShell, PageHeader, Panel, CopyButton, ErrorNote, Disclaimer } from "@/components/app-shell";
import { streamAi } from "@/lib/ai-client";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chatbot — Workplace Assistant" },
      { name: "description", content: "A conversational workplace assistant with context-aware answers." },
      { property: "og:title", content: "AI Workplace Chatbot" },
      { property: "og:description", content: "A conversational workplace assistant with context-aware answers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const history: Msg[] = [...msgs, { role: "user", content: text }];
    setMsgs([...history, { role: "assistant", content: "" }]);
    setInput(""); setErr(""); setLoading(true);
    try {
      await streamAi({ mode: "chat", messages: history }, (t) =>
        setMsgs([...history, { role: "assistant", content: t }]),
      );
    } catch (e) {
      setErr((e as Error).message);
      setMsgs(history);
    } finally { setLoading(false); }
  }

  return (
    <AppShell>
      <div className="flex items-start justify-between">
        <PageHeader title="AI Chatbot" desc="Ask anything about your work — planning, writing, analysis." />
        {msgs.length > 0 && (
          <button onClick={() => setMsgs([])} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted">
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
      <Panel className="flex h-[65vh] flex-col p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {msgs.length === 0 && (
            <div className="grid h-full place-items-center text-center text-sm text-muted-foreground">
              <div><Bot className="mx-auto mb-2 h-8 w-8 text-primary" />Start a conversation, e.g. "Help me prioritise 6 tasks for this week."</div>
            </div>
          )}
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-sm text-primary-foreground">{m.content}</div>
              </div>
            ) : (
              <div key={i} className="flex gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-primary"><Bot className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {m.content || <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  {m.content && !(loading && i === msgs.length - 1) && <div className="mt-2"><CopyButton text={m.content} /></div>}
                </div>
              </div>
            ),
          )}
          {err && <ErrorNote msg={err} />}
          <div ref={end} />
        </div>
        <div className="border-t p-3">
          <div className="flex items-end gap-2 rounded-xl border bg-background p-2 focus-within:border-primary">
            <textarea
              rows={1}
              className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none"
              placeholder="Message the assistant…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            />
            <button aria-label="Send" onClick={send} disabled={loading || !input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </Panel>
      <Disclaimer />
    </AppShell>
  );
}
