/**
 * The verb toolbar: Format · Minify · Validate, an optional trailing slot (the
 * page passes the Sample/Clear/Copy icon trio), the tab-width Select, and
 * Download. Styled for the white workbench panes (dark ink, azure accents).
 * The page positions it (docked at the top of the input pane on desktop,
 * sticky between the panes on narrow) — this component is layout-agnostic.
 */
import { type ReactNode } from "react";
import { CheckCircle, Download, Minimize2, WrapText } from "lucide-react";
import { Button } from "@/components/base/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { tabWidthOptions, type TabWidth } from "@/data/seed";
import type { InputFormat } from "@/lib/parse";

interface ActionBarProps {
  inputFormat: InputFormat;
  onInputFormatChange: (format: InputFormat) => void;
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  tabWidth: TabWidth;
  onTabWidthChange: (width: TabWidth) => void;
  onDownload: () => void;
  downloadDisabled: boolean;
  className?: string;
  /** Trailing controls rendered after the verbs (the Sample/Clear/Copy trio). */
  children?: ReactNode;
  /** The syntax-theme picker, rendered between the Indent select and Download. */
  themeMenu?: ReactNode;
}

export function ActionBar({
  inputFormat,
  onInputFormatChange,
  onFormat,
  onMinify,
  onValidate,
  tabWidth,
  onTabWidthChange,
  onDownload,
  downloadDisabled,
  className,
  children,
  themeMenu,
}: ActionBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Select value={inputFormat} onValueChange={(value) => onInputFormatChange(value as InputFormat)}>
        <SelectTrigger aria-label="Формат входных данных" className="h-11 w-[100px] border-[var(--jf-hairline)] bg-[var(--jf-pane-bg)] text-[var(--jf-ink)] lg:h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto">Авто</SelectItem>
          <SelectItem value="json">JSON</SelectItem>
          <SelectItem value="jsonl">JSONL</SelectItem>
        </SelectContent>
      </Select>
      <div role="toolbar" aria-label="Действия с JSON" className="flex flex-wrap items-center gap-2">
        <Button onClick={onFormat} className="gap-1.5 bg-[var(--tint-from)] text-primary-foreground hover:bg-[var(--tint-from)] hover:opacity-90">
          <WrapText className="size-4" aria-hidden />
          Форматировать
        </Button>
        <Button onClick={onMinify} className="gap-1.5 bg-[var(--tint-from)] text-primary-foreground hover:bg-[var(--tint-from)] hover:opacity-90">
          <Minimize2 className="size-4" aria-hidden />
          Сжать
        </Button>
        <Button onClick={onValidate} className="gap-1.5 bg-[var(--tint-from)] text-primary-foreground hover:bg-[var(--tint-from)] hover:opacity-90">
          <CheckCircle className="size-4" aria-hidden />
          Проверить
        </Button>
      </div>

      {children}

      <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
        <div className="flex items-center gap-2 text-sm text-[var(--jf-ink)]">
          <span id="indent-width-label" className="text-[var(--jf-ink-dim)]">
            Отступ:
          </span>
          <Select
            value={String(tabWidth)}
            onValueChange={(value) => onTabWidthChange(Number(value) as TabWidth)}
          >
            <SelectTrigger
              aria-labelledby="indent-width-label"
              className="h-11 w-[112px] rounded-full border-[var(--jf-hairline)] bg-[var(--jf-pane-bg)] text-[var(--jf-ink)] sm:w-[130px] lg:h-9 [&>svg]:opacity-80"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tabWidthOptions.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {themeMenu}

        <Button
          variant="outline"
          onClick={onDownload}
          disabled={downloadDisabled}
          aria-label="Скачать результат"
          className="min-w-11 gap-1.5 border-[var(--jf-hairline)] bg-[var(--jf-pane-bg)] px-3 text-[var(--jf-ink)] hover:bg-[color-mix(in_srgb,var(--jf-ink)_12%,transparent)] hover:text-[var(--jf-ink)] disabled:opacity-50"
        >
          <Download className="size-4" aria-hidden />
          <span className="hidden sm:inline">Скачать</span>
        </Button>
      </div>
    </div>
  );
}
