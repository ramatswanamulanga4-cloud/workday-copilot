import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, FileSearch, MessagesSquare, Menu, X, ShieldAlert, Check, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/email", label: "Email Generator", icon: Mail },
  { to: "/research", label: "Research Assistant", icon: FileSearch },
  { to: "/chat", label: "AI Chatbot", icon: MessagesSquare },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const sidebar = (
    <nav className="flex h-full flex-col gap-1 p-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">W</div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Workplace Assistant</div>
          <div className="text-xs text-muted-foreground">AI productivity</div>
        </div>
      </div>
      {nav.map((n) => {
        const active = path === n.to;
        return (
          <Link
            key={n.to}
            to={n.to}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <n.icon className="h-4 w-4" />
            {n.label}
          </Link>
        );
      })}
      <div className="mt-auto rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground">
        <ShieldAlert className="mb-1 h-4 w-4 text-primary" />
        AI can make mistakes. Verify outputs and don't enter confidential information.
      </div>
    </nav>
  );
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r bg-card md:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-card">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-card px-4 md:hidden">
          <button aria-label="Open menu" onClick={() => setOpen(!open)} className="rounded-md p-1.5 hover:bg-muted">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold">Workplace Assistant</span>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border bg-card p-5 shadow-sm ${className}`}>{children}</div>;
}

export function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      disabled={!text}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
      className="inline-flex items-center gap-1.5 rounded-md border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
    >
      {done ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

export function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 ${props.className ?? ""}`}
    />
  );
}

export function ErrorNote({ msg }: { msg: string }) {
  return <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{msg}</div>;
}

export function Disclaimer() {
  return (
    <p className="mt-6 text-xs text-muted-foreground">
      Responsible AI: generated content may be inaccurate. Review before use and avoid entering confidential or personal workplace data.
    </p>
  );
}

export const fieldCls =
  "w-full rounded-lg border bg-card px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";
