import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play, Github, Sparkles } from "lucide-react";
import { RepoPreview } from "./RepoPreview";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />

      <div className="relative mx-auto grid max-w-[1280px] gap-16 px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Understand any{" "}
            <span className="text-gradient-primary font-bold">GitHub repository</span> in minutes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-6 max-w-xl text-lg text-muted-foreground"
          >
            Paste a repo URL and DevPilot AI turns thousands of files into a clear summary,
            architecture map and personal learning roadmap — designed for students, developers and
            hackathon teams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/analyze"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
            >
              Analyze Repository
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card/60 px-5 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-card"
            >
              <Play className="h-4 w-4" />
              View Demo Dashboard
            </Link>
          </motion.div>

          <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground">
            <Github className="h-3.5 w-3.5" />
            Works with any public repo — no signup, no setup.
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative"
        >
          <RepoPreview />
        </motion.div>
      </div>
    </section>
  );
}
