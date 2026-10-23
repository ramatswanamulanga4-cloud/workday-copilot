export async function streamAi(
  body: Record<string, unknown>,
  onText: (full: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: signal ?? null,
  });
  if (!res.ok || !res.body) throw new Error("Could not reach the AI service.");
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += dec.decode(value, { stream: true });
    const i = full.indexOf("\u0000ERROR:");
    if (i >= 0) throw new Error(full.slice(i + 7) || "AI request failed.");
    onText(full);
  }
  if (!full.trim()) throw new Error("The AI returned an empty response. Please try again.");
  return full;
}
