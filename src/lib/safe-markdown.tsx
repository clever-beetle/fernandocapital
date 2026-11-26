import React from "react";

/**
 * Validates that a URL uses a safe http://, https://, or single-slash relative path.
 * Blocks javascript:, data:, vbscript:, file:, and protocol-relative // URLs.
 */
export function isSafeHttpUrl(rawUrl: string | undefined | null): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Renders inline Markdown tokens (**bold**, *italic*, `code`, [text](url))
 * into pure React elements without ever using dangerouslySetInnerHTML.
 */
export function renderInlineMarkdown(text: string): React.ReactNode[] {
  if (!text) return [];

  const tokenRegex =
    /(\*\*[^*]+\*\*|\*[^*\n]+\*|`[^`\n]+`|\[[^\]]+\]\([^)\s]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;

    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={idx} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={idx} className="italic">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code
          key={idx}
          className="rounded bg-secondary px-1.5 py-0.5 font-mono text-[0.85em] text-foreground border border-border/60"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      if (isSafeHttpUrl(href)) {
        const isExternal = href.startsWith("http://") || href.startsWith("https://");
        return (
          <a
            key={idx}
            href={href.trim()}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer nofollow" : undefined}
            className="font-semibold text-[#101B2C] dark:text-[#C3A477] underline underline-offset-4 hover:opacity-80"
          >
            {label}
          </a>
        );
      }
      return <span key={idx}>{label}</span>;
    }

    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

/**
 * Pure React-element Markdown renderer.
 * Supports headings (#, ##, ###), blockquotes (>), unordered lists (- / *),
 * ordered lists (1.), fenced code blocks (```), Markdown tables (|...|), and paragraphs.
 * Never injects raw HTML (completely immune to XSS via <script>, onerror, or javascript: links).
 */
export function SafeMarkdown({ content }: { content: string }) {
  const lines = String(content || "").replace(/\r\n/g, "\n").split("\n");
  const elements: React.ReactNode[] = [];

  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    // Fenced code block
    if (trimmed.startsWith("```")) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) i += 1;
      elements.push(
        <pre
          key={`code-${i}`}
          className="my-4 overflow-x-auto rounded-xl border border-border bg-secondary/60 p-4 font-mono text-xs sm:text-sm text-foreground"
        >
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      continue;
    }

    // Headings
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="mt-6 mb-2.5 text-lg sm:text-xl font-bold tracking-tight text-foreground"
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      i += 1;
      continue;
    }
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="mt-8 mb-3 text-xl sm:text-2xl font-bold tracking-tight text-foreground border-b border-border pb-2"
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      i += 1;
      continue;
    }
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="mt-8 mb-3 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      i += 1;
      continue;
    }

    // Horizontal rule
    if (trimmed === "---" || trimmed === "***") {
      elements.push(<hr key={`hr-${i}`} className="my-6 border-border" />);
      i += 1;
      continue;
    }

    // Blockquote
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="my-4 border-l-4 border-[#C3A477] bg-secondary/40 px-4 py-3 text-sm italic text-foreground/90 rounded-r-xl"
        >
          {renderInlineMarkdown(quoteLines.join(" "))}
        </blockquote>
      );
      continue;
    }

    // Markdown Table
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableRows: string[][] = [];
      while (
        i < lines.length &&
        lines[i].trim().startsWith("|") &&
        lines[i].trim().endsWith("|")
      ) {
        const rowLine = lines[i].trim();
        const cells = rowLine
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        const isSeparatorRow = cells.every((c) => /^:?-{2,}:?$/.test(c));
        if (!isSeparatorRow) {
          tableRows.push(cells);
        }
        i += 1;
      }
      if (tableRows.length > 0) {
        const [headerRow, ...bodyRows] = tableRows;
        elements.push(
          <div
            key={`tbl-${i}`}
            className="my-5 overflow-x-auto rounded-xl border border-border"
          >
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-secondary/70 font-mono text-xs uppercase text-muted-foreground">
                <tr>
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="py-2.5 px-3.5 font-semibold text-foreground">
                      {renderInlineMarkdown(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              {bodyRows.length > 0 && (
                <tbody className="divide-y divide-border bg-card">
                  {bodyRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-secondary/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3.5 text-foreground/90">
                          {renderInlineMarkdown(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        );
      }
      continue;
    }

    // Unordered list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i += 1;
      }
      elements.push(
        <ul key={`ul-${i}`} className="my-3 space-y-1.5 pl-5 list-disc text-sm sm:text-base text-foreground/90">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      elements.push(
        <ol key={`ol-${i}`} className="my-3 space-y-1.5 pl-5 list-decimal text-sm sm:text-base text-foreground/90">
          {items.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Standard paragraph
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trim().startsWith("#") &&
      !lines[i].trim().startsWith(">") &&
      !lines[i].trim().startsWith("```") &&
      !(lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) &&
      !/^[-*]\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i += 1;
    }
    elements.push(
      <p key={`p-${i}`} className="my-3.5 text-sm sm:text-base leading-relaxed text-foreground/90">
        {renderInlineMarkdown(paraLines.join(" "))}
      </p>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}
