import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Search } from "lucide-react";
import { AppShell, PageHeader, Panel, CopyButton, PrimaryButton, ErrorNote, Disclaimer, fieldCls } from "@/components/app-shell";
import { streamAi } from "@/lib/ai-client";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Workplace Assistant" },
      { name: "description", content: "Summarise text, topics and URLs into key findings and recommendations." },
      { property: "og:title", content: "AI Research Assistant" },
      { property: "og:description", content: "Summarise text, topics and URLs into key findings and recommendations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const [input, setInput] = useState("");
  const [url, setUrl] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function run() {
    setLoading(true); setErr(""); setOut("");
    try { await streamAi({ mode: "research", input, url: url.trim() || undefined }, setOut); }
    catch (e) { setErr((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <AppShell>
      <PageHeader title="AI Research Assistant" desc="Paste text, name a topic, or add a public URL." />
      <Panel>
        <label className="text-sm font-medium">Text or topic</label>
        <textarea className={`${fieldCls} mt-2 min-h-36`} placeholder="Paste a report, article, or type a topic like 'hybrid work trends'." value={input} onChange={(e) => setInput(e.target.value)} />
        <label className="mt-4 block text-sm font-medium">URL (optional)</label>
        <input className={`${fieldCls} mt-2`} placeholder="https://example.com/article" value={url} onChange={(e) => setUrl(e.target.value)} />
        <PrimaryButton className="mt-5" disabled={loading || (!input.trim() && !url.trim())} onClick={run}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Analysing…" : "Analyse"}
        </PrimaryButton>
      </Panel>
      {(out || err || loading) && (
        <Panel className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Findings (editable)</span>
            <CopyButton text={out} />
          </div>
          {err && <ErrorNote msg={err} />}
          <textarea className={`${fieldCls} min-h-96 leading-relaxed`} placeholder="Analysing…" value={out} onChange={(e) => setOut(e.target.value)} />
        </Panel>
      )}
      <Disclaimer />
    </AppShell>
  );
}
