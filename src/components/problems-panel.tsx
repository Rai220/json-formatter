/**
 * Problems tab content + verdict badge.
 *
 * Valid: a green "Корректный JSON" verdict (one-shot green pulse) over a 4-row stats
 * table (Keys, Max depth, Size, Type). Invalid: a red band with the caret-style
 * parse report and a "К строке N →" affordance that scrolls the input editor
 * to the offending line. Copy/Download of the Problems tab use `problemsReportText`.
 */
import { ArrowRight, Check, X } from "lucide-react";
import { Badge } from "@/components/base/badge";
import { Button } from "@/components/base/button";
import type { DocumentResult, JsonValue } from "@/lib/parse";
import { formatBytes, byteLength } from "@/components/byte-badge";

export interface JsonStats {
  keys: number;
  maxDepth: number;
  size: number;
  type: string;
}

/** Recursively count object keys (array indices are not keys). */
function countKeys(value: JsonValue): number {
  if (Array.isArray(value)) {
    return value.reduce<number>((sum, item) => sum + countKeys(item), 0);
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value);
    return keys.length + keys.reduce<number>((sum, key) => sum + countKeys(value[key]), 0);
  }
  return 0;
}

/** Container-nesting depth: root container = 1, scalars contribute 0. */
function containerDepth(value: JsonValue): number {
  if (Array.isArray(value)) {
    return 1 + value.reduce<number>((max, item) => Math.max(max, containerDepth(item)), 0);
  }
  if (value !== null && typeof value === "object") {
    return (
      1 + Object.values(value).reduce<number>((max, item) => Math.max(max, containerDepth(item)), 0)
    );
  }
  return 0;
}

function rootType(value: JsonValue): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "массив";
  return ({ object: "объект", string: "строка", number: "число", boolean: "логическое значение" } as Record<string, string>)[typeof value] ?? typeof value;
}

export function computeStats(value: JsonValue, source: string): JsonStats {
  return {
    keys: countKeys(value),
    maxDepth: containerDepth(value),
    size: byteLength(source),
    type: rootType(value),
  };
}

/** Plain-text report for Copy / `problems.txt` Download. */
export function problemsReportText(result: DocumentResult): string {
  if (result.status === "valid") {
    const stats = computeStats(result.value, result.source);
    return [
      "✓ Корректный JSON",
      "",
      `Ключи      ${stats.keys}`,
      `Глубина    ${stats.maxDepth}`,
      `Размер     ${formatBytes(stats.size)}`,
      `Тип        ${stats.type}`,
    ].join("\n");
  }
  if (result.status === "invalid") {
    const { report } = result;
    return [
      `Ошибка в строке ${report.line}`,
      report.context,
      " ".repeat(report.caretOffset) + "^",
      report.message,
    ].join("\n");
  }
  return "";
}

/** Verdict badge for the output tab bar (green ✓ / red ✗). */
export function ProblemsVerdictBadge({ result }: { result: DocumentResult }) {
  if (result.status === "valid") {
    return (
      <Badge color="green" className="gap-1">
        <Check className="size-3.5" aria-hidden />
        <span className="sr-only">Корректный JSON</span>
      </Badge>
    );
  }
  if (result.status === "invalid") {
    return (
      <Badge color="red" className="gap-1">
        <X className="size-3.5" aria-hidden />
        <span className="sr-only">Некорректный JSON</span>
      </Badge>
    );
  }
  return null;
}

interface ProblemsPanelProps {
  result: DocumentResult;
  onJumpToLine: (line: number) => void;
}

export function ProblemsPanel({ result, onJumpToLine }: ProblemsPanelProps) {
  if (result.status === "valid") {
    const stats = computeStats(result.value, result.source);
    const rows: [string, string][] = [
      ["Ключи", String(stats.keys)],
      ["Глубина", String(stats.maxDepth)],
      ["Размер", formatBytes(stats.size)],
      ["Тип", stats.type],
    ];
    return (
      <div className="p-4">
        <div className="mb-5 flex items-center gap-2">
          <span className="animate-pulse-green flex size-7 items-center justify-center rounded-full bg-green-pastel text-green-dark">
            <Check className="size-4" aria-hidden />
          </span>
          <span className="text-2xl font-bold text-[var(--jf-ink)]">Корректный JSON</span>
        </div>
        <dl className="max-w-xs font-mono text-sm tabular-nums">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between border-b border-[var(--jf-hairline)] py-1.5">
              <dt className="text-[var(--jf-ink-dim)]">{label}</dt>
              <dd className="font-semibold text-[var(--jf-ink)]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  if (result.status === "invalid") {
    const { report } = result;
    return (
      <div className="p-4">
        <div className="rounded-md border border-[var(--jf-danger-border)] bg-[var(--jf-danger-bg)] p-4 text-[var(--jf-danger-ink)]">
          <p className="mb-2 font-mono text-sm font-semibold">
            Ошибка в строке {report.line}
          </p>
          <pre className="overflow-x-auto whitespace-pre font-mono text-sm">
            {report.context}
            {"\n"}
            {" ".repeat(report.caretOffset) + "^"}
          </pre>
          <p className="mt-2 font-mono text-sm">{report.message}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 h-8 gap-1 px-2 text-[var(--jf-danger-ink)] hover:bg-[color-mix(in_srgb,var(--jf-danger-ink)_12%,transparent)] hover:text-[var(--jf-danger-ink)]"
            onClick={() => onJumpToLine(report.line)}
          >
            К строке {report.line}
            <ArrowRight className="size-3.5" aria-hidden />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
