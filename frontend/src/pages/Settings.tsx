import { useState } from "react";
import { Github, Check, Sparkles, Users, FolderKanban, Crown } from "lucide-react";
import { useAuth } from "../lib/auth";
import type { UserSettings } from "../lib/types";

export default function Settings() {
  const { user, updateSettings } = useAuth();
  const [saved, setSaved] = useState(false);

  if (!user) return null;
  const s = user.settings;

  async function patch(p: Partial<UserSettings>) {
    setSaved(false);
    await updateSettings(p);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="mx-auto max-w-3xl px-8 py-10">
      <header className="mb-6 flex items-center gap-3">
        <Github className="h-6 w-6 text-accent" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Settings</h1>
          <p className="text-sm text-ink-soft">Personalize your DevPilot workspace</p>
        </div>
      </header>

      <Section title="Connected GitHub account">
        <div className="flex items-center gap-3">
          {user.avatar_url && (
            <img
              src={user.avatar_url}
              alt=""
              className="h-10 w-10 rounded-full border border-line"
            />
          )}
          <div>
            <p className="text-sm font-medium text-ink">@{user.username}</p>
            <p className="text-xs text-ink-faint">{user.email ?? "No public email"}</p>
          </div>
          <span className="ml-auto rounded-md bg-success/15 px-2 py-1 text-xs font-medium text-success">
            Connected
          </span>
        </div>
      </Section>

      <Section title="Appearance">
        <Field label="Theme">
          <Select
            value={s.theme}
            onChange={(v) => patch({ theme: v as UserSettings["theme"] })}
            options={[
              { value: "system", label: "System" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
        </Field>
      </Section>

      <Section title="AI preferences">
        <Field label="AI provider">
          <Select
            value={s.ai_provider}
            onChange={(v) => patch({ ai_provider: v })}
            options={[
              { value: "openai", label: "OpenAI" },
              { value: "anthropic", label: "Anthropic" },
              { value: "local", label: "Local model" },
            ]}
          />
        </Field>
        <Field label="Language">
          <Select
            value={s.language}
            onChange={(v) => patch({ language: v })}
            options={[
              { value: "en", label: "English" },
              { value: "es", label: "Español" },
              { value: "de", label: "Deutsch" },
              { value: "ja", label: "日本語" },
              { value: "zh", label: "中文" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Notifications">
        <Toggle
          label="Email notifications"
          description="Summaries and digests about your analyses"
          checked={s.email_notifications}
          onChange={(v) => patch({ email_notifications: v })}
        />
        <Toggle
          label="Product updates"
          description="News about new DevPilot features"
          checked={s.product_updates}
          onChange={(v) => patch({ product_updates: v })}
        />
      </Section>

      <Section title="Privacy">
        <Toggle
          label="Public profile"
          description="Allow others to see your saved analyses"
          checked={s.public_profile}
          onChange={(v) => patch({ public_profile: v })}
        />
      </Section>

      {saved && (
        <p className="mb-4 flex items-center gap-1 text-sm text-success">
          <Check className="h-4 w-4" /> Settings saved
        </p>
      )}

      <h2 className="mb-3 mt-10 text-sm font-medium uppercase tracking-wide text-ink-faint">
        Coming soon
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <ComingSoon
          icon={Users}
          title="Teams & Organizations"
          text="Shared workspaces for your org."
        />
        <ComingSoon
          icon={FolderKanban}
          title="Repository Collections"
          text="Group favorites into collections."
        />
        <ComingSoon icon={Crown} title="Premium Features" text="Advanced AI memory and exports." />
        <ComingSoon
          icon={Sparkles}
          title="AI Memory"
          text="Conversational context across analyses."
        />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border border-line bg-surface p-5">
      <h3 className="mb-4 text-sm font-medium text-ink">{title}</h3>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-ink-soft">{label}</span>
      {children}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none focus:border-accent"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-ink">{label}</p>
        <p className="text-xs text-ink-faint">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-accent" : "bg-elevated"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-[22px]" : "left-0.5"}`}
        />
      </button>
    </div>
  );
}

function ComingSoon({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-dashed border-line bg-surface/50 p-4">
      <Icon className="h-5 w-5 text-ink-faint" />
      <div>
        <p className="text-sm font-medium text-ink-soft">{title}</p>
        <p className="text-xs text-ink-faint">{text}</p>
      </div>
      <span className="ml-auto rounded-md bg-elevated px-2 py-1 text-[10px] uppercase tracking-wide text-ink-faint">
        Soon
      </span>
    </div>
  );
}
