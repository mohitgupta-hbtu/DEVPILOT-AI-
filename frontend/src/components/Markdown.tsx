import { Fragment, type ReactNode } from "react";

/**
 * Minimal, dependency-free markdown renderer for the Mentor's structured answers.
 * Covers the subset the backend emits: fenced code, inline code, bold, headings,
 * ordered/unordered lists, links, and paragraphs.
 */
function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (tok.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-elevated px-1 py-0.5 text-[0.85em] text-ink">
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-ink">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else {
      const lm = /\[([^\]]+)\]\(([^)]+)\)/.exec(tok);
      if (lm) {
        nodes.push(
          <a
            key={key}
            href={lm[2]}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline underline-offset-2"
          >
            {lm[1]}
          </a>,
        );
      }
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export default function Markdown({ source }: { source: string }) {
  const lines = source.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre
          key={key++}
          className="my-2 overflow-x-auto rounded-lg border border-line bg-canvas p-3 text-xs text-ink-soft"
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    if (/^#{1,4} /.test(line)) {
      const level = line.match(/^#+/)![0].length;
      const text = line.replace(/^#+\s/, "");
      const cls = [
        "text-base font-semibold",
        "text-sm font-semibold",
        "text-sm font-medium",
        "text-sm font-medium",
      ][level - 1];
      blocks.push(
        <p key={key++} className={`mt-3 mb-1 ${cls} text-ink`}>
          {renderInline(text, `h${key}`)}
        </p>,
      );
      i++;
      continue;
    }

    if (/^[-*] /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(lines[i].replace(/^[-*] /, ""));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-1 ml-4 list-disc space-y-1 text-sm text-ink-soft">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ul${key}-${idx}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-1 ml-4 list-decimal space-y-1 text-sm text-ink-soft">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it, `ol${key}-${idx}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    if (line.trim() === "") {
      i++;
      continue;
    }

    // Paragraph: gather until blank line
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,4} |[-*] |\d+\. |```)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="my-1.5 text-sm leading-relaxed text-ink-soft">
        {renderInline(para.join(" "), `p${key}`)}
      </p>,
    );
  }

  return <Fragment>{blocks}</Fragment>;
}
