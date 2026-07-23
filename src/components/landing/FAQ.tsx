import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Sparkles } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <section id="faq" className="py-28 bg-background relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="mx-auto max-w-5xl px-6 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <p className="text-xl sm:text-2xl font-bold tracking-widest text-primary uppercase font-mono">
            FAQ
          </p>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15] font-sans">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground font-normal">
            The most common questions we get asked about DevPilot AI.
          </p>
        </div>

        {/* Kokonut UI Style Floating Question Pills */}
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 max-w-4xl mx-auto pt-2">
          {faqs.map((f, i) => {
            const isActive = activeTab === i;
            return (
              <button
                key={f.q}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "relative px-5 py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer border",
                  isActive
                    ? "bg-primary/10 border-primary text-foreground shadow-lg shadow-primary/15 font-semibold"
                    : "bg-card/40 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/20",
                )}
              >
                <span>{f.q}</span>

                {/* Bottom Active Glow Accent Bar */}
                {isActive && (
                  <motion.div
                    layoutId="faq-active-bar"
                    className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.8)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-full border-t border-border/40 my-6" />

        {/* Active Answer Display Area */}
        <div className="max-w-3xl mx-auto min-h-[140px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.99 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="p-8 rounded-2xl border border-primary/20 bg-gradient-to-b from-card/80 to-background/90 backdrop-blur-xl shadow-2xl space-y-3 relative overflow-hidden group"
            >
              {/* Subtle top corner ambient accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2.5 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" />
                <span>
                  Question {activeTab + 1} of {faqs.length}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-foreground font-sans tracking-tight">
                {faqs[activeTab].q}
              </h3>

              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-1 font-sans font-normal">
                {faqs[activeTab].a}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
