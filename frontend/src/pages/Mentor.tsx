import { useEffect, useMemo, useRef, useState } from "react";
import {
  MessageSquare,
  Send,
  Pin,
  Search,
  Download,
  FileText,
  Sparkles,
  BookOpen,
  FolderTree,
  Star,
  Github,
  X,
  RotateCcw,
} from "lucide-react";
import {
  mentorApi,
  storageKey,
  type ChatMessage,
  type MentorAnswer,
  type MentorContext,
} from "../lib/mentor";
import { ApiError } from "../lib/api";
import Markdown from "../components/Markdown";

const SUGGESTED = [
  "Explain the project architecture",
  "Show me the learning roadmap",
  "Which folder should I read first?",
  "What are the important dependencies?",
  "Where can I make my first contribution?",
  "Explain the project like I'm a beginner",
];

function uid() {
  return Math.random().toString(36).slice(2);
}

export default function Mentor() {
  const [repoUrl, setRepoUrl] = useState("");
  const [context, setContext] = useState<MentorContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loadingCtx, setLoadingCtx] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore conversation when a repo context is loaded
  useEffect(() => {
    if (!context) return;
    try {
      const raw = localStorage.getItem(storageKey(`${context.owner}/${context.name}`));
      if (raw) setMessages(JSON.parse(raw));
    } catch {
      /* ignore corrupt storage */
    }
  }, [context]);

  useEffect(() => {
    if (context)
      localStorage.setItem(
        storageKey(`${context.owner}/${context.name}`),
        JSON.stringify(messages),
      );
  }, [messages, context]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loadingChat]);

  async function handleLoad(e: React.FormEvent) {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setLoadingCtx(true);
    setError(null);
    try {
      const ctx = await mentorApi.loadContext(repoUrl);
      setContext(ctx);
      setMessages([]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load repository.");
      setContext(null);
    } finally {
      setLoadingCtx(false);
    }
  }

  function toHistory() {
    return messages
      .map((m) =>
        m.role === "user"
          ? { role: "user", content: m.text ?? "" }
          : {
              role: "assistant",
              content: `${m.answer?.summary ?? ""}\n\n${m.answer?.explanation ?? m.text ?? ""}`,
            },
      )
      .filter((m) => m.content);
  }

  async function sendQuestion(q: string) {
    const question = q.trim();
    if (!question || !context || loadingChat) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", text: question };
    const history = toHistory();
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoadingChat(true);
    setError(null);
    try {
      const answer: MentorAnswer = await mentorApi.ask(
        `${context.owner}/${context.name}`,
        question,
        history,
      );
      setMessages((m) => [...m, { id: uid(), role: "assistant", answer }]);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "The mentor could not respond.";
      setMessages((m) => [...m, { id: uid(), role: "assistant", text: msg, error: true }]);
    } finally {
      setLoadingChat(false);
    }
  }

  function togglePin(id: string) {
    setMessages((m) => m.map((msg) => (msg.id === id ? { ...msg, pinned: !msg.pinned } : msg)));
  }

  function clearConversation() {
    setMessages([]);
    if (context) localStorage.removeItem(storageKey(`${context.owner}/${context.name}`));
  }

  const visibleMessages = useMemo(() => {
    let list = messages;
    if (pinnedOnly) list = list.filter((m) => m.pinned);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        if (m.role === "user") return m.text?.toLowerCase().includes(q);
        const a = m.answer;
        return (
          a?.summary.toLowerCase().includes(q) ||
          a?.explanation.toLowerCase().includes(q) ||
          a?.relatedFiles.some((f) => f.toLowerCase().includes(q)) ||
          a?.evidence.some((e) => e.detail.toLowerCase().includes(q))
        );
      });
    }
    return list;
  }, [messages, search, pinnedOnly]);

  return (
    <div className="mx-auto flex h-[calc(100vh-2rem)] max-w-7xl flex-col gap-4 px-6 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-line bg-surface p-2">
            <MessageSquare className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-ink">Repository Mentor</h1>
            <p className="text-xs text-ink-faint">
              Ask natural-language questions about any analyzed repository.
            </p>
          </div>
        </div>

        {context && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPinnedOnly((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                pinnedOnly
                  ? "border-accent/50 bg-accent-soft text-ink"
                  : "border-line bg-surface text-ink-soft hover:text-ink"
              }`}
            >
              <Pin className="h-3.5 w-3.5" /> Pinned
            </button>
            <button
              onClick={exportMarkdown}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft transition-colors hover:text-ink"
            >
              <Download className="h-3.5 w-3.5" /> Markdown
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft transition-colors hover:text-ink"
            >
              <FileText className="h-3.5 w-3.5" /> PDF
            </button>
            <button
              onClick={clearConversation}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs text-ink-soft transition-colors hover:text-danger"
            >
              <RotateCcw className="h-3.5 w-3.5" /> New
            </button>
          </div>
        )}
      </header>

      <form onSubmit={handleLoad} className="flex gap-2">
        <div className="relative flex-1">
          <Github className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            placeholder="https://github.com/owner/repo"
            aria-label="Repository URL"
            className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-accent/50"
          />
        </div>
        <button
          type="submit"
          disabled={loadingCtx}
          className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loadingCtx ? "Loading…" : "Load repository"}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </div>
      )}

      {!context ? (
        <EmptyState />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <RepoContextPanel context={context} />

          <section className="flex min-h-0 flex-col rounded-xl border border-line bg-surface">
            <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
              <Search className="h-4 w-4 text-ink-faint" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search previous answers…"
                aria-label="Search answers"
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-ink-faint hover:text-ink">
                  <X className="h-4 w-4" />
                </button>
              )}
              <span className="text-xs text-ink-faint">
                {visibleMessages.length}/{messages.length}
              </span>
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.length === 0 && <SuggestedQuestions onPick={sendQuestion} />}

              {messages.length > 0 && visibleMessages.length === 0 && (
                <p className="py-8 text-center text-sm text-ink-faint">
                  No messages match your search.
                </p>
              )}

              {visibleMessages.map((m) => (
                <ChatBubble
                  key={m.id}
                  message={m}
                  onPick={sendQuestion}
                  onPin={() => togglePin(m.id)}
                  onExport={exportMarkdown}
                />
              ))}

              {loadingChat && (
                <div className="flex items-center gap-2 text-sm text-ink-faint">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />{" "}
                  Mentor is thinking…
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendQuestion(input);
              }}
              className="flex items-center gap-2 border-t border-line px-4 py-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about this repository…"
                aria-label="Your question"
                className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent/50"
              />
              <button
                type="submit"
                disabled={loadingChat || !input.trim()}
                className="rounded-lg bg-accent p-2 text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );

  function exportMarkdown() {
    if (!context) return;
    const head = `# DevPilot AI — Repository Mentor\n\n**Repository:** ${context.owner}/${context.name}\n**URL:** ${repoUrl}\n\n`;
    const body = messages
      .map((m) => {
        if (m.role === "user") return `## You\n\n${m.text}\n`;
        const a = m.answer;
        if (!a) return `## Mentor\n\n${m.text}\n`;
        return (
          `## Mentor\n\n**${a.summary}**\n\n${a.explanation}\n\n` +
          (a.evidence.length
            ? `**Evidence:**\n${a.evidence.map((e) => `- _${e.source}_: ${e.detail}`).join("\n")}\n\n`
            : "") +
          (a.nextSteps.length
            ? `**Next steps:**\n${a.nextSteps.map((s) => `- ${s}`).join("\n")}\n\n`
            : "") +
          (a.relatedFiles.length ? `**Related files:** ${a.relatedFiles.join(", ")}\n\n` : "") +
          (a.followUpQuestions.length
            ? `**Follow-ups:**\n${a.followUpQuestions.map((q) => `- ${q}`).join("\n")}\n`
            : "")
        );
      })
      .join("\n");
    const blob = new Blob([head + body], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${context.owner}-${context.name}-mentor.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-surface/40 text-center">
      <Sparkles className="h-8 w-8 text-accent" />
      <p className="max-w-sm text-sm text-ink-soft">
        Load a public GitHub repository above to start a guided conversation with the Repository
        Mentor. It answers using the repository's README, file tree, and structure — never generic
        guesses.
      </p>
    </div>
  );
}

function SuggestedQuestions({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        Suggested questions
      </p>
      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((q) => (
          <button
            key={q}
            onClick={() => onPick(q)}
            className="rounded-full border border-line bg-canvas px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

function RepoContextPanel({ context }: { context: MentorContext }) {
  return (
    <aside className="hidden min-h-0 overflow-y-auto rounded-xl border border-line bg-surface p-4 lg:block">
      <div className="flex items-center gap-2">
        <Github className="h-4 w-4 text-ink-soft" />
        <h2 className="truncate text-sm font-semibold text-ink">
          {context.owner}/{context.name}
        </h2>
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        {context.stars} ★ · {context.forks} forks · {context.fileCount} files
      </p>
      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{context.description}</p>

      <Section icon={Star} title="Tech stack">
        <div className="flex flex-wrap gap-1.5">
          {context.techStack.map((t) => (
            <span key={t} className="rounded-md bg-accent-soft px-2 py-0.5 text-[11px] text-accent">
              {t}
            </span>
          ))}
        </div>
      </Section>

      <Section icon={FolderTree} title="Start here">
        <ul className="space-y-1 text-xs text-ink-soft">
          {context.suggestedStartingFolders.map((f) => (
            <li key={f} className="font-mono">
              {f}
            </li>
          ))}
        </ul>
      </Section>

      <Section icon={BookOpen} title="Entry points">
        <ul className="space-y-1 text-xs text-ink-soft">
          {context.entryPoints.map((f) => (
            <li key={f} className="font-mono">
              {f}
            </li>
          ))}
        </ul>
      </Section>

      {context.healthScore != null && (
        <Section icon={Sparkles} title="Health">
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-elevated">
              <div className="h-full bg-accent" style={{ width: `${context.healthScore}%` }} />
            </div>
            <span className="text-xs text-ink-soft">{context.healthScore}</span>
          </div>
        </Section>
      )}

      <Section icon={FolderTree} title="Top folders">
        <div className="flex flex-wrap gap-1.5">
          {context.topFolders.map((f) => (
            <span
              key={f}
              className="rounded-md bg-elevated px-2 py-0.5 font-mono text-[11px] text-ink-soft"
            >
              {f}
            </span>
          ))}
        </div>
      </Section>
    </aside>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 border-t border-line-soft pt-3">
      <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
        <Icon className="h-3.5 w-3.5" /> {title}
      </h3>
      {children}
    </div>
  );
}

function ChatBubble({
  message,
  onPick,
  onPin,
  onExport,
}: {
  message: ChatMessage;
  onPick: (q: string) => void;
  onPin: () => void;
  onExport: () => void;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent px-4 py-2 text-sm text-white">
          {message.text}
        </div>
      </div>
    );
  }

  const a = message.answer;
  return (
    <div className="flex flex-col gap-2 rounded-2xl rounded-bl-sm border border-line bg-canvas p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold text-ink">{a?.summary ?? "Mentor"}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onExport}
            title="Export"
            className="rounded p-1 text-ink-faint hover:text-ink"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onPin}
            title="Pin"
            className={`rounded p-1 hover:text-ink ${message.pinned ? "text-accent" : "text-ink-faint"}`}
          >
            <Pin className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {a ? (
        <>
          <div className="text-ink-soft">
            <Markdown source={a.explanation} />
          </div>

          {a.evidence.length > 0 && (
            <div className="rounded-lg border border-line bg-surface p-3">
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Evidence
              </p>
              <ul className="space-y-1">
                {a.evidence.map((e, i) => (
                  <li key={i} className="text-xs text-ink-soft">
                    <span className="font-mono text-accent">{e.source}</span> — {e.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {a.relatedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {a.relatedFiles.map((f) => (
                <span
                  key={f}
                  className="rounded-md bg-elevated px-2 py-0.5 font-mono text-[11px] text-ink-soft"
                >
                  {f}
                </span>
              ))}
            </div>
          )}

          {a.nextSteps.length > 0 && (
            <div>
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Next steps
              </p>
              <ul className="list-decimal space-y-0.5 pl-4 text-xs text-ink-soft">
                {a.nextSteps.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {a.followUpQuestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {a.followUpQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => onPick(q)}
                  className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-ink-soft transition-colors hover:border-accent/50 hover:text-ink"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <p className={`text-sm ${message.error ? "text-danger" : "text-ink-soft"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}
