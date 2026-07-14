import { motion } from "framer-motion";
import { FileText, Network, Map, HeartPulse, Cpu, Save } from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Repository Summary",
    body: "A crisp, plain-English overview of what the project does, who it's for and how it's shaped.",
  },
  {
    icon: Network,
    title: "Architecture Overview",
    body: "See modules, packages and how they connect — without opening a single file.",
  },
  {
    icon: Map,
    title: "Learning Roadmap",
    body: "A step-by-step path from your current skill level to confidently working in the codebase.",
  },
  {
    icon: Cpu,
    title: "Flexible LLM Integrations",
    body: "Don't get locked into a single AI ecosystem. Connect your API keys for Gemini, OpenAI, or OpenRouter and analyze codebases using the LLM of your choice.",
  },
  {
    icon: HeartPulse,
    title: "Interactive Health Dashboard",
    body: "Unlike static reports, our interactive dashboard lets you dive deep into test coverage, complexity metrics, and actionable tech-debt resolution plans.",
  },
  {
    icon: Save,
    title: "Your Persistent Workspace",
    body: "Sign in with GitHub to save repository histories, bookmark your favorites, and manage your analysis dashboard securely on the cloud.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 relative">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything you need to read a repo like the author.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Six focused views that turn any codebase into something you can navigate, learn from and
            contribute to.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card/40 p-8 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/20 text-primary transition-all duration-300 group-hover:from-primary/25 group-hover:to-accent/15 group-hover:border-primary/40 group-hover:shadow-[0_0_15px_rgba(var(--ring),0.15)]">
                    <Icon className="h-5.5 w-5.5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mt-6 text-xl font-medium tracking-tight text-foreground transition-colors group-hover:text-primary">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
                    {f.body}
                  </p>
                </div>
                {/* Subtle bottom glow indicator on hover */}
                <div className="absolute inset-x-0 bottom-0 h-[2px] w-full scale-x-0 bg-gradient-to-r from-primary/30 to-accent/30 transition-transform duration-500 group-hover:scale-x-100 rounded-b-2xl" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
