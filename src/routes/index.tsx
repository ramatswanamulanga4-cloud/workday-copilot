import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, FileSearch, MessagesSquare, ArrowRight } from "lucide-react";
import { AppShell, PageHeader, Panel, Disclaimer } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant" },
      { name: "description", content: "Write emails, summarise research and chat with an AI workplace assistant." },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "Write emails, summarise research and chat with an AI workplace assistant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const tools = [
  { to: "/email", icon: Mail, title: "Smart Email Generator", desc: "Draft professional emails in Formal, Friendly or Persuasive tones." },
  { to: "/research", icon: FileSearch, title: "AI Research Assistant", desc: "Summarise text, topics or URLs into findings and recommendations." },
  { to: "/chat", icon: MessagesSquare, title: "AI Chatbot", desc: "Ask workplace questions and get detailed, context-aware answers." },
] as const;

function Index() {
  return (
    <AppShell>
      <PageHeader title="Good to see you" desc="Pick a tool to get your workplace tasks done faster." />
      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Panel className="h-full transition-colors group-hover:border-primary/40">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-accent text-primary">
                <t.icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold">{t.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Panel>
          </Link>
        ))}
      </div>
      <Panel className="mt-6">
        <h2 className="font-semibold">How it works</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Every response is generated live by Lovable AI through a secure server connection — no API keys are stored in your
          browser and no sample answers are used. Your inputs are kept only in this browser tab.
        </p>
      </Panel>
      <Disclaimer />
    </AppShell>
  );
}
