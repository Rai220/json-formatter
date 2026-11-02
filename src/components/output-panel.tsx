/**
 * The tabbed output panel: six triggers (Formatted · Minified · XML · CSV · YAML
 * · Problems), a read-only editor per content tab, the Problems verdict/report,
 * the gray byte badge / green-red verdict badge in the tab bar, and per-tab
 * Copy/Download. Derivation is lazy — only the active tab is computed, from the
 * shared `DocumentResult`, and never throws.
 */
import { Copy, Download } from "lucide-react";
import { Reveal, RevealItem } from "@/components/tools/reveal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/base/button";
import { OutputEditor } from "@/components/output-editor";
import { ByteBadge, byteLength, formatBytes } from "@/components/byte-badge";
import { ProblemsPanel, ProblemsVerdictBadge, problemsReportText } from "@/components/problems-panel";
import type { DocumentResult } from "@/lib/parse";
import type { EditorLanguage } from "@/lib/editor-setup";
import type { EditorTheme } from "@/lib/editor-themes";
import type { IndentWidth } from "@/lib/formatter";
import { formatDocument } from "@/lib/formatter";
import { minifyDocument } from "@/lib/minifier";
import { emitXml } from "@/lib/xml-emitter";
import { emitYaml } from "@/lib/yaml-emitter";
import { emitCsv, CSV_NON_TABULAR } from "@/lib/csv-flattener";
import { emitJsonl } from "@/lib/jsonl";

export type TabId = "formatted" | "minified" | "jsonl" | "xml" | "csv" | "yaml" | "problems";

const TABS: { id: TabId; label: string }[] = [
  { id: "formatted", label: "JSON" },
  { id: "minified", label: "Сжатый" },
  { id: "jsonl", label: "JSONL" },
  { id: "xml", label: "XML" },
  { id: "csv", label: "CSV" },
  { id: "yaml", label: "YAML" },
  { id: "problems", label: "Проверка" },
];

const EMPTY_MSG = "Нет данных.";
const INVALID_MSG = "Некорректные данные. Подробности во вкладке «Проверка».";
const HINT_MSG = "Результат не выбран.";

/** A fully-resolved view of the active tab — the single source of truth for
 * both the output panel and the action-bar Download button. */
export interface TabView {
  tabId: TabId | null;
  kind: "hint" | "empty" | "invalid-line" | "csv-error" | "editor" | "problems";
  message?: string;
  content?: string;
  language?: EditorLanguage;
  copyText?: string;
  copyLabel?: string;
  downloadName?: string;
  byteSize?: number | null;
  showVerdict?: boolean;
  minifyStat?: string;
  canExport: boolean;
}

/** Pure, lazy derivation of the active tab. Reads `DocumentResult`; never throws. */
export function deriveTab(
  tabId: TabId | null,
  result: DocumentResult,
  indentWidth: IndentWidth,
): TabView {
  if (!tabId) {
    return {
      tabId: null,
      kind: "hint",
      message: result.status === "empty" ? EMPTY_MSG : HINT_MSG,
      canExport: false,
      byteSize: null,
    };
  }

  if (result.status === "empty") {
    return { tabId, kind: "empty", message: EMPTY_MSG, canExport: false, byteSize: null };
  }

  if (tabId === "problems") {
    return {
      tabId,
      kind: "problems",
      copyText: problemsReportText(result),
      copyLabel: "Отчёт скопирован.",
      downloadName: "problems.txt",
      canExport: true,
      byteSize: null,
      showVerdict: true,
    };
  }

  // The five content tabs.
  if (result.status === "invalid") {
    return { tabId, kind: "invalid-line", message: INVALID_MSG, canExport: false, byteSize: null };
  }

  switch (tabId) {
    case "jsonl": {
      const content = emitJsonl(result);
      return { tabId, kind: "editor", content, language: "json", copyText: content,
        copyLabel: "JSONL скопирован.", downloadName: "formatted.jsonl", byteSize: byteLength(content), canExport: true };
    }
    case "formatted": {
      const content = formatDocument(result, indentWidth);
      return {
        tabId,
        kind: "editor",
        content,
        language: "json",
        copyText: content,
        copyLabel: "JSON скопирован.",
        downloadName: "formatted.json",
        byteSize: byteLength(content),
        canExport: true,
      };
    }
    case "minified": {
      const minified = minifyDocument(result);
      if (!minified) return { tabId, kind: "empty", message: EMPTY_MSG, canExport: false };
      const percent = Math.round((1 - minified.minifiedBytes / minified.originalBytes) * 100);
      return {
        tabId,
        kind: "editor",
        content: minified.text,
        language: "json",
        copyText: minified.text,
        copyLabel: "Сжатый JSON скопирован.",
        downloadName: "minified.json",
        byteSize: minified.minifiedBytes,
        minifyStat: `${formatBytes(minified.originalBytes)} → ${formatBytes(minified.minifiedBytes)}  (${percent}% экономии)`,
        canExport: true,
      };
    }
    case "xml": {
      const content = emitXml(result);
      return {
        tabId,
        kind: "editor",
        content,
        language: "xml",
        copyText: content,
        copyLabel: "XML скопирован.",
        downloadName: "converted.xml",
        byteSize: byteLength(content),
        canExport: true,
      };
    }
    case "yaml": {
      const content = emitYaml(result);
      return {
        tabId,
        kind: "editor",
        content,
        language: "yaml",
        copyText: content,
        copyLabel: "YAML скопирован.",
        downloadName: "converted.yaml",
        byteSize: byteLength(content),
        canExport: true,
      };
    }
    case "csv": {
      const csv = emitCsv(result);
      if (csv.ok !== true) {
        const csvMessage: string | undefined = (csv as { message?: string }).message;
        return {
          tabId,
          kind: "csv-error",
          message: csvMessage ?? CSV_NON_TABULAR,
          canExport: false,
          byteSize: null,
        };
      }
      return {
        tabId,
        kind: "editor",
        content: csv.text,
        language: "plaintext",
        copyText: csv.text,
        copyLabel: "CSV скопирован.",
        downloadName: "converted.csv",
        byteSize: byteLength(csv.text),
        canExport: true,
      };
    }
  }
}

interface OutputPanelProps {
  result: DocumentResult;
  theme: EditorTheme;
  activeTab: TabId | null;
  view: TabView;
  onTabChange: (tab: TabId) => void;
  onCopy: (text: string, label: string) => void;
  onDownload: (name: string, content: string) => void;
  onJumpToLine: (line: number) => void;
}

export function OutputPanel({
  result,
  theme,
  activeTab,
  view,
  onTabChange,
  onCopy,
  onDownload,
  onJumpToLine,
}: OutputPanelProps) {
  const activeLabel = TABS.find((tab) => tab.id === activeTab)?.label ?? "";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs value={activeTab ?? ""} onValueChange={(value) => onTabChange(value as TabId)}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--jf-hairline)] px-3 py-2">
          <TabsList aria-label="Форматы результата" className="h-auto w-full flex-wrap bg-[color-mix(in_srgb,var(--jf-ink)_8%,transparent)] md:w-auto">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="h-11 text-[var(--jf-ink)] data-[state=active]:bg-[var(--tint-from)] data-[state=active]:text-primary-foreground lg:h-8">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto min-h-6 pr-1" aria-live="polite" aria-atomic="true">
            {view.byteSize != null ? (
              <ByteBadge bytes={view.byteSize} />
            ) : view.showVerdict ? (
              <ProblemsVerdictBadge result={result} />
            ) : null}
          </div>
        </div>
      </Tabs>

      <div className="min-h-0 flex-1 overflow-hidden px-1 pt-2">
        <Reveal immediate key={`${activeTab ?? "none"}:${view.kind}:${view.content?.length ?? 0}`} className="h-full">
          <RevealItem className="h-full">
            {view.kind === "problems" ? (
              <div className="h-full overflow-auto">
                <ProblemsPanel result={result} onJumpToLine={onJumpToLine} />
              </div>
            ) : view.kind === "editor" ? (
              <div className="flex h-full flex-col">
                {view.minifyStat ? (
                  <p role="status" className="mb-2 px-2 font-mono text-sm text-[var(--jf-ink)]">
                    {view.minifyStat}
                  </p>
                ) : null}
                <div className="min-h-0 flex-1">
                  <OutputEditor content={view.content ?? ""} language={view.language ?? "plaintext"} theme={theme} />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <p role="status" className="text-sm text-[var(--jf-ink-dim)]">
                  {view.message}
                </p>
              </div>
            )}
          </RevealItem>
        </Reveal>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1 border-t border-[var(--jf-hairline)] px-3 py-1.5">
        <Button
          variant="ghost"
          size="sm"
          disabled={!view.canExport}
          aria-label={`Копировать результат: ${activeLabel}`}
          onClick={() => view.copyText != null && onCopy(view.copyText, view.copyLabel ?? "Скопировано.")}
          className="h-11 gap-1.5 px-3 text-[var(--jf-ink)] hover:bg-[color-mix(in_srgb,var(--jf-ink)_12%,transparent)] hover:text-[var(--jf-ink)] disabled:opacity-40 lg:h-9 lg:px-2"
        >
          <Copy className="size-4" aria-hidden />
          Копировать
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!view.canExport}
          aria-label={`Скачать результат: ${activeLabel}`}
          onClick={() => view.copyText != null && onDownload(view.downloadName ?? "output.txt", view.copyText)}
          className="h-11 gap-1.5 px-3 text-[var(--jf-ink)] hover:bg-[color-mix(in_srgb,var(--jf-ink)_12%,transparent)] hover:text-[var(--jf-ink)] disabled:opacity-40 lg:h-9 lg:px-2"
        >
          <Download className="size-4" aria-hidden />
          Скачать
        </Button>
      </div>
    </div>
  );
}
