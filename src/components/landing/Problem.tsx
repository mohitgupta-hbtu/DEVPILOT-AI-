import { AlertTriangle, Clock, Search } from "lucide-react";

const items = [
  {
    icon: Clock,
    title: "Hours lost to onboarding",
    points: [
      "Eats up the first week of joining any new project.",
      "Devs spend countless hours piecing together logic instead of writing code.",
      "Creates immense cognitive load trying to understand legacy codebases.",
    ],
  },
  {
    icon: Search,
    title: "No clear entry point",
    points: [
      "READMEs rarely explain structural architecture or entry hooks.",
      "Finding core logic is like looking for a needle in a haystack.",
      "Developers get overwhelmed by hundreds of deeply nested folders.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Guesswork before contributing",
    points: [
      "Requires opening dozens of files just to understand a 2-line change.",
      "Triggers constant anxiety of accidentally breaking undetected flows.",
      "Makes even minor bug fixes feel like risky production operations.",
    ],
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
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            Great repos are hard to read. Even for experienced developers.
          </h2>
        </div>
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div
                key={it.title}
                className="group rounded-2xl border border-border bg-background/50 p-8 transition-all duration-300 hover:-translate-y-2 hover:border-primary/50 hover:bg-card/50 hover:shadow-2xl hover:shadow-primary/10 cursor-default flex flex-col justify-between"
              >
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl border border-border bg-card text-primary transition-all duration-300 group-hover:scale-110 group-hover:border-primary/50 group-hover:bg-primary/10">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-6 text-xl font-semibold transition-colors duration-300 group-hover:text-primary">
                    {it.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {it.points.map((pt, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm/relaxed text-muted-foreground text-left"
                      >
                        <span className="text-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
