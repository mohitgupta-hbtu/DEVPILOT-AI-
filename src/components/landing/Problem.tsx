import { AlertTriangle, Clock, Search } from "lucide-react";

const items = [
  {
    icon: Clock,
    title: "Hours lost to onboarding",
    body: "Reading through unfamiliar codebases eats the first week of every new project. Developers spend countless hours piecing together logic instead of writing actual features. The immense cognitive load required to understand legacy code shouldn't be the norm.",
  },
  {
    icon: Search,
    title: "No clear entry point",
    body: "README files rarely explain how a repository is structurally designed or where to start reading. Searching for the core logic is often like looking for a needle in a haystack, leaving developers overwhelmed by hundreds of deeply nested folders with no guidance.",
  },
  {
    icon: AlertTriangle,
    title: "Guesswork before contributing",
    body: "You end up opening 40 different files just to trace the dependencies for a simple two-line change. This manual tracing causes a constant anxiety of accidentally breaking undetected side effects, making even minor bug fixes feel like risky operations.",
  },
];

export function Problem() {
  return (
    <section className="border-y border-border/60 bg-card/30 py-24">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="max-w-3xl">
          <p className="text-base sm:text-lg font-semibold tracking-wider text-primary uppercase">
            The problem
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            Great repos are hard to read. Even for experienced developers.
          </h2>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.title}
                className="group rounded-2xl border border-border bg-background/50 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:bg-card/50 hover:shadow-2xl hover:shadow-primary/10 cursor-default"
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-card text-primary transition-all duration-300 group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/10">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                  {it.title}
                </h3>
                <p className="mt-3 text-base/relaxed text-muted-foreground">{it.body}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
