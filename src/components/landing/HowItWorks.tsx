const steps = [
  {
    n: "01",
    title: "Click Analyze Repository",
    body: "Hit the analyze button and let our engine instantly process the entire project structure and logic.",
  },
  {
    n: "02",
    title: "Paste a repo URL",
    body: "Drop in any public GitHub link — big or small, monorepo or single package.",
  },
  {
    n: "03",
    title: "DevPilot reads the code",
    body: "Files, dependencies and structure are analyzed in parallel with our smart AI orchestrator.",
  },
  {
    n: "04",
    title: "Get an actionable map",
    body: "Summary, architecture, roadmap and health — ready to browse, share or extend.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-border/60 bg-card/30 py-28">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-base sm:text-lg font-semibold tracking-wider text-primary uppercase">
            How it works
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            Four steps from URL to understanding.
          </h2>
        </div>
        <ol className="mt-16 grid gap-8 md:grid-cols-2">
          {steps.map((s) => (
            <li
              key={s.n}
              className="group relative rounded-2xl border border-border bg-background/50 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:bg-card/50 hover:shadow-2xl hover:shadow-primary/10 cursor-default"
            >
              <div className="font-mono text-base font-bold text-primary transition-transform duration-300 group-hover:scale-110 origin-left">
                {s.n}
              </div>
              <h3 className="mt-5 text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                {s.title}
              </h3>
              <p className="mt-3 text-base/relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
