import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do I need to sign in to use DevPilot AI?",
    a: "Signing in with GitHub is recommended. It instantly unlocks your personalized dashboard where you can manage your API keys, bookmark repository histories, and access our interactive tech-debt resolution tools.",
  },
  {
    q: "Which repositories are supported?",
    a: "We support any public GitHub repository, from lightweight utility libraries to massive enterprise monorepos. Simply paste the URL and our engine will begin mapping the folder structure.",
  },
  {
    q: "Is my codebase secure during analysis?",
    a: "Absolutely. We parse the repository layout locally and only send vital code chunks directly to your configured LLM provider. Your code is never permanently stored on our servers unless you explicitly save the snapshot.",
  },
  {
    q: "Who is DevPilot AI built for?",
    a: "It's engineered for developers onboarding to undocumented projects, hackathon teams learning chaotic codebases, open-source contributors finding safe starting points, and team leads auditing complex technical debt.",
  },
  {
    q: "Do I have to pay a monthly subscription fee?",
    a: "No! DevPilot AI operates on a 'Bring Your Own Key' (BYOK) model. Connect your personal Gemini, OpenAI, or OpenRouter keys directly. You face zero recurring platform fees or hidden markups.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-28">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center">
          <p className="text-xl sm:text-2xl font-bold tracking-widest text-primary uppercase">
            FAQ
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.1]">
            Frequently asked questions
          </h2>
        </div>
        <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-background/50">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left hover:bg-muted/10 transition-colors duration-200"
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-semibold sm:text-lg transition-colors group-hover:text-primary">
                    {f.q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-primary",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid overflow-hidden px-6 text-base text-muted-foreground transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] pb-6" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0 leading-relaxed">{f.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
