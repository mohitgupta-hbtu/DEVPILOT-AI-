import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <span className="text-xs font-bold">D</span>
          </span>
          <span className="font-medium">DevPilot AI</span>
          <span className="text-muted-foreground">· Understand any repo, faster.</span>
        </div>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <a href="#features" className="hover:text-foreground">
            Features
          </a>
          <a href="#how" className="hover:text-foreground">
            How it works
          </a>
          <a href="#faq" className="hover:text-foreground">
            FAQ
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-[1280px] px-6 py-4 text-xs text-muted-foreground text-center sm:text-left">
          © {new Date().getFullYear()} DevPilot AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
