import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { AppShell, PageHeader, Panel, CopyButton, PrimaryButton, ErrorNote, Disclaimer, fieldCls } from "@/components/app-shell";
import { streamAi } from "@/lib/ai-client";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — Workplace Assistant" },
      { name: "description", content: "Generate professional emails in Formal, Friendly or Persuasive tones." },
      { property: "og:title", content: "Smart Email Generator" },
      { property: "og:description", content: "Generate professional emails in Formal, Friendly or Persuasive tones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailPage,
});

const tones = ["Formal", "Friendly", "Persuasive"];

function EmailPage() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("Formal");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true); setErr(""); setOut("");
    try { await streamAi({ mode: "email", tone, input }, setOut); }
    catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <AppShell>
      <PageHeader title="Smart Email Generator" desc="Describe what you need and choose a tone." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel>
          <label className="text-sm font-medium">Instructions</label>
          <textarea
            className={`${fieldCls} mt-2 min-h-40`}
            placeholder="e.g. Ask my manager to move Thursday's project review to next week because the client data arrives late."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="mt-4 text-sm font-medium">Tone</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`rounded-full border px-3 py-1 text-sm ${tone === t ? "border-primary bg-accent text-primary" : "hover:bg-muted"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <PrimaryButton className="mt-5 w-full" disabled={loading || !input.trim()} onClick={run}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? "Writing…" : "Generate email"}
          </PrimaryButton>
        </Panel>
        <Panel className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Result (editable)</span>
            <CopyButton text={out} />
          </div>
          {err && <ErrorNote msg={err} />}
          <textarea
            className={`${fieldCls} min-h-72 flex-1 font-normal leading-relaxed`}
            placeholder={loading ? "Generating…" : "Your email will appear here."}
            value={out}
            onChange={(e) => setOut(e.target.value)}
          />
        </Panel>
      </div>
      <Disclaimer />
    </AppShell>
  );
}
