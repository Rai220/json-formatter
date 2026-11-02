/**
 * JSON Formatter — the editor route (`/editor`; `/` is the welcome page).
 *
 * Composes `CalcCanvas` (sticky wordmark bar + Upload/Share actions), the
 * responsive two-column / stacked layout, the CodeMirror input editor, the verb
 * action bar, and the tabbed output panel. Everything is client-only: the
 * document restores from URL hash → localStorage → seed, autosaves to
 * localStorage on every keystroke, and compresses into the URL hash on Share.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Braces, Copy, Eraser, RefreshCw, Share2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { CalcCanvas } from "@/components/tools/calc-canvas";
import { Button } from "@/components/base/button";
import { InputEditor, type InputEditorHandle } from "@/components/input-editor";
import { ActionBar } from "@/components/action-bar";
import { OutputPanel, deriveTab, type TabId } from "@/components/output-panel";
import { parseDocument, type InputFormat } from "@/lib/parse";
import { formatDocument } from "@/lib/formatter";
import { encodeShare, decodeHash } from "@/lib/hash";
import { useDataProvider, type TabWidth } from "@/lib/data-provider";
import { resolveTheme, type EditorTheme } from "@/lib/editor-themes";
import { ThemeMenu } from "@/components/theme-menu";
import { readableInk } from "@/lib/contrast";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import "./jf.css";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const THEME_KEY = "jf_theme";

/** Restore the viewer's theme preference (never part of the Share URL). */
function readInitialTheme(): EditorTheme {
  try {
    return resolveTheme(window.localStorage.getItem(THEME_KEY));
  } catch {
    return resolveTheme(null);
  }
}

/** Clear the hash from the address bar without adding a history entry. */
function stripHash() {
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

type InitialDocument = { doc: string; displaced: string | null };

/**
 * Priority read on first render: URL hash → localStorage autosave → seed.
 * When a shared link replaces a different, non-empty saved document, that
 * document is returned as `displaced` so the viewer can restore it.
 */
function readInitialDocument(sampleJson: string, storageKey: string): InitialDocument {
  if (typeof window === "undefined") return { doc: sampleJson, displaced: null };
  let stored: string | null = null;
  try {
    stored = window.localStorage.getItem(storageKey);
  } catch {
    /* private mode — fall through to seed */
  }
  const fromHash = decodeHash(window.location.hash);
  if (fromHash != null) stripHash();
  if (fromHash != null) {
    // Consume the hash once: from here on localStorage owns persistence, so a
    // later reload never resurrects a stale shared snapshot over newer edits.
    const displaced = stored != null && stored.trim() !== "" && stored !== fromHash ? stored : null;
    return { doc: fromHash, displaced };
  }
  return { doc: stored ?? sampleJson, displaced: null };
}

/** Save text to a deterministic filename via an object URL + anchor click. */
function downloadFile(name: string, content: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Write to the clipboard and report the real outcome — never a false "copied". */
async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

async function copyToClipboard(text: string, label: string) {
  if (await writeClipboard(text)) {
    toast(label, { duration: 3000 });
  } else {
    toast.error("Не удалось скопировать: браузер запретил доступ к буферу обмена.", { duration: 4000 });
  }
}

/** A small ghost icon button for the input-panel header. */
function IconButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="size-11 rounded-full text-[var(--jf-ink)] hover:bg-[color-mix(in_srgb,var(--jf-ink)_12%,transparent)] hover:text-[var(--jf-ink)] lg:size-9"
    >
      {icon}
    </Button>
  );
}

export default function JsonFormatter() {
  const { sampleJson, defaultTabWidth, storageKey } = useDataProvider();
  const isMobile = useIsMobile();

  const [initial] = useState<InitialDocument>(() => readInitialDocument(sampleJson, storageKey));
  const [doc, setDoc] = useState<string>(initial.doc);
  const docRef = useRef(doc);
  docRef.current = doc;
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [indentWidth, setIndentWidth] = useState<TabWidth>(defaultTabWidth);
  const [activeTab, setActiveTab] = useState<TabId | null>("formatted");
  const [inputFormat, setInputFormat] = useState<InputFormat>("auto");
  const [theme, setTheme] = useState<EditorTheme>(() => readInitialTheme());

  const handleThemeChange = (id: string) => {
    const next = resolveTheme(id);
    setTheme(next);
    try {
      window.localStorage.setItem(THEME_KEY, next.id);
    } catch {
      /* private mode — the choice lives for this tab only */
    }
  };

  const inputRef = useRef<InputEditorHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const autosaveWarned = useRef(false);

  const result = useMemo(() => parseDocument(doc, inputFormat), [doc, inputFormat]);
  const errors = useMemo(
    () => (result.status === "invalid" ? [result.report] : result.status === "valid" ? (result.issues ?? []) : []),
    [result],
  );
  const view = useMemo(() => deriveTab(activeTab, result, indentWidth), [activeTab, result, indentWidth]);

  // Autosave on every document change (empty → remove the key).
  useEffect(() => {
    try {
      if (doc.trim() === "") {
        window.localStorage.removeItem(storageKey);
      } else {
        window.localStorage.setItem(storageKey, doc);
      }
    } catch {
      if (!autosaveWarned.current) {
        autosaveWarned.current = true;
        toast("Автосохранение недоступно: документ сохранится только в этой вкладке.", { duration: 3000 });
      }
    }
  }, [doc, storageKey]);

  // Offer the viewer's own document back after a shared link replaced it.
  const offeredRestore = useRef(false);
  useEffect(() => {
    const offerRestore = (previous: string) => {
      toast("Открыт документ по ссылке.", {
        duration: 10000,
        action: { label: "Вернуть свой", onClick: () => setDoc(previous) },
      });
    };
    // Deferred one tick: the page-level Toaster subscribes in its own effect,
    // which runs after this one on first mount — an immediate toast is lost.
    let pending: number | undefined;
    const displaced = initial.displaced;
    if (displaced && !offeredRestore.current) {
      pending = window.setTimeout(() => {
        offeredRestore.current = true;
        offerRestore(displaced);
      }, 0);
    }
    // A share link opened in a tab already on /editor only changes the hash.
    const onHashChange = () => {
      const shared = decodeHash(window.location.hash);
      if (shared != null) stripHash();
      if (shared == null) return;
      const previous = docRef.current;
      setDoc(shared);
      if (previous.trim() !== "" && previous !== shared) offerRestore(previous);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.clearTimeout(pending);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [initial]);

  const handleSample = () => setDoc(sampleJson);
  const handleExtract = () => {
    const extracted = parseDocument(doc, "auto");
    if (extracted.status !== "valid") {
      toast.error("Не удалось найти корректный JSON.");
      return;
    }
    setInputFormat("json");
    setDoc(formatDocument(extracted, indentWidth));
    setActiveTab("formatted");
  };
  const handleClear = () => {
    setDoc("");
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      /* ignore */
    }
  };
  const handleCopyInput = () => void copyToClipboard(doc, "Исходный текст скопирован.");

  const handleShare = () => {
    const encoded = encodeShare(doc, window.location.href);
    if (!encoded.ok) {
      toast("Документ слишком большой для ссылки. Скопируйте или скачайте его.", { duration: 3000 });
      return;
    }
    void copyToClipboard(encoded.url, "Ссылка на документ скопирована.");
  };

  const handleUploadClick = () => fileRef.current?.click();
  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast("Файл слишком большой: максимум 5 МБ.", { duration: 3000 });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setDoc(String(e.target?.result ?? ""));
    reader.onerror = () => toast("Не удалось прочитать файл.", { duration: 3000 });
    reader.readAsText(file);
  };

  const handleDownloadActive = () => {
    if (view.canExport && view.copyText != null && view.downloadName) {
      downloadFile(view.downloadName, view.copyText);
    }
  };

  const actionBarProps = {
    inputFormat,
    onInputFormatChange: setInputFormat,
    themeMenu: <ThemeMenu theme={theme} onThemeChange={handleThemeChange} />,
    onFormat: () => setActiveTab("formatted"),
    onMinify: () => setActiveTab("minified"),
    onValidate: () => setActiveTab("problems"),
    tabWidth: indentWidth,
    onTabWidthChange: setIndentWidth,
    onDownload: handleDownloadActive,
    downloadDisabled: !view.canExport,
  };

  const inputPane = (
    <section
      id="json-input"
      aria-label="Исходный текст"
      className="flex h-full min-h-0 flex-col overflow-hidden"
    >
      <div className="hidden border-b border-[var(--jf-hairline)] px-3 py-2 md:block">
        <ActionBar {...actionBarProps}>
          <div className="flex items-center gap-0.5">
            <IconButton icon={<RefreshCw className="size-4" />} label="Пример" onClick={handleSample} />
            <IconButton icon={<Trash2 className="size-4" />} label="Очистить" onClick={handleClear} />
            <IconButton icon={<Copy className="size-4" />} label="Копировать" onClick={handleCopyInput} />
            <IconButton icon={<Eraser className="size-4" />} label="Убрать текст вокруг JSON" onClick={handleExtract} />
          </div>
        </ActionBar>
      </div>
      <div className="h-[320px] md:h-auto md:min-h-0 md:flex-1">
        <InputEditor
          ref={inputRef}
          value={doc}
          onChange={setDoc}
          onCursorChange={setCursor}
          errors={errors}
          theme={theme}
        />
      </div>
      <footer className="flex justify-end border-t border-[var(--jf-hairline)] px-4 py-1.5">
        <span className="font-mono text-xs text-[var(--jf-ink-dim)]" aria-hidden>
          Стр. {cursor.line}, ст. {cursor.column}
        </span>
      </footer>
    </section>
  );

  const outputPane = (
    <section aria-label="Результат" className="flex h-[520px] flex-col overflow-hidden md:h-full md:min-h-0">
      <OutputPanel
        result={result}
        theme={theme}
        activeTab={activeTab}
        view={view}
        onTabChange={setActiveTab}
        onCopy={(text, label) => void copyToClipboard(text, label)}
        onDownload={downloadFile}
        onJumpToLine={(line) => inputRef.current?.jumpToLine(line)}
      />
    </section>
  );

  return (
    <CalcCanvas
      appName="Форматировщик JSON"
      tint="azure"
      icon={<Braces className="size-5 text-primary-foreground" aria-hidden />}
      className="max-w-none gap-0 p-0 md:h-[calc(100dvh-3.5rem)]"
      skipLink={
        <a
          href="#json-input"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-lg"
        >
          Перейти к редактору
        </a>
      }
      actions={
        <>
          <Button
            variant="outline"
            aria-label="Открыть файл JSON или JSONL"
            onClick={handleUploadClick}
            className="jf-header-action gap-1.5"
          >
            <Upload className="size-4" aria-hidden />
            <span className="hidden min-[430px]:inline">Открыть</span>
          </Button>
          <Button
            variant="outline"
            aria-label="Поделиться JSON"
            onClick={handleShare}
            className="jf-header-action gap-1.5"
          >
            <Share2 className="size-4" aria-hidden />
            <span className="hidden min-[430px]:inline">Поделиться</span>
          </Button>
          <input ref={fileRef} type="file" accept=".json,.jsonl,.ndjson,.txt" className="hidden" onChange={handleFileSelected} />
        </>
      }
    >
      {/* Full-bleed workbench: resizable 60/40 panes on desktop and the existing
          stacked layout with a sticky action bar on narrow screens. */}
      <div
        data-jf-workbench
        className="flex min-h-0 flex-col bg-[var(--jf-pane-bg)] text-[var(--jf-ink)] md:h-full"
        style={
          {
            "--jf-pane-bg": theme.css.paneBg,
            "--jf-ink": readableInk(theme.css.ink, theme.css.paneBg, 1, 5.5),
            "--jf-ink-dim": readableInk(theme.css.inkDim, theme.css.paneBg, 0.82),
            "--jf-hairline": theme.css.hairline,
            "--jf-danger-bg": theme.css.dangerBg,
            "--jf-danger-ink": theme.css.dangerInk,
            "--jf-danger-border": theme.css.dangerBorder,
          } as React.CSSProperties
        }
      >

        {isMobile ? (
          <>
            {inputPane}
            <div
              className="sticky z-20 border-y border-[var(--jf-hairline)] bg-[var(--jf-pane-bg)] px-3 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.10)]"
              style={{ top: "var(--calc-header-h)" }}
            >
              <ActionBar {...actionBarProps}>
                <div className="flex items-center gap-0.5">
                  <IconButton icon={<RefreshCw className="size-4" />} label="Пример" onClick={handleSample} />
                  <IconButton icon={<Trash2 className="size-4" />} label="Очистить" onClick={handleClear} />
                  <IconButton icon={<Copy className="size-4" />} label="Копировать" onClick={handleCopyInput} />
                  <IconButton icon={<Eraser className="size-4" />} label="Убрать текст вокруг JSON" onClick={handleExtract} />
                </div>
              </ActionBar>
            </div>
            {outputPane}
          </>
        ) : (
          <ResizablePanelGroup
            id="json-workbench-panes"
            orientation="horizontal"
            defaultLayout={{ input: 60, output: 40 }}
            className="min-h-0"
          >
            <ResizablePanel id="input" minSize="360px" defaultSize="60%">
              {inputPane}
            </ResizablePanel>
            <ResizableHandle
              withHandle
              aria-label="Изменить ширину редакторов"
              className="w-1 bg-[var(--jf-hairline)] after:w-3 focus-visible:ring-2 focus-visible:ring-[var(--tint-from)] [&>div]:h-8 [&>div]:w-3 [&>div]:border-[var(--jf-hairline)] [&>div]:bg-[var(--jf-pane-bg)] [&>div]:text-[var(--jf-ink)]"
            />
            <ResizablePanel id="output" minSize="360px" defaultSize="40%">
              {outputPane}
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </div>
    </CalcCanvas>
  );
}
