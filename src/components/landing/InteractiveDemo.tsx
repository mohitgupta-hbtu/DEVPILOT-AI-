import { useState } from "react";
import { ArrowRight, Github, Sparkles } from "lucide-react";
import { RepoPreview } from "./RepoPreview";

const suggestions = [
  "facebook/react",
  "vercel/next.js",
  "tailwindlabs/tailwindcss",
  "shadcn-ui/ui",
];

export function InteractiveDemo() {
  const [value, setValue] = useState("https://github.com/vercel/next.js");
  const [running, setRunning] = useState(false);

  return (
    <section id="demo" className="py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Interactive demo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Try it on a repo you already know.
          </h2>
          <p className="mt-4 text-muted-foreground">
            This is a scripted preview. Real analysis lands with the dashboard.
          </p>
        </div>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
          <div className="rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
            <label className="text-xs font-medium text-muted-foreground">Repository URL</label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3">
              <Github className="h-4 w-4 text-muted-foreground" />
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-11 flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground"
                placeholder="https://github.com/owner/repo"
                aria-label="Repository URL"
              />
            </div>
            <button
              onClick={() => {
                setRunning(true);
                setTimeout(() => setRunning(false), 6000);
              }}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.01]"
            >
              {running ? (
                <>
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  Analyzing…
                </>
              ) : (
                <>
                  Analyze Repository
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            <div className="mt-6">
              <p className="text-xs font-medium text-muted-foreground">Try one of these</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setValue(`https://github.com/${s}`)}
                    className="rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <RepoPreview />
        </div>
      </div>
    </section>
  );
}
