/**
 * The syntax-theme picker — a dropdown listing the registry's themes with a
 * three-chip swatch (surface · ink · accent) per row and a check on the active
 * one. The trigger shows the active theme's name from `md` up and compresses
 * to swatch-only below (the 375px toolbar row would need a third wrap line
 * otherwise); its aria-label always carries the full name.
 *
 * At 45 themes the list is grouped Dark / Light and scrolls, with a count in
 * the header. A flat list of that length is a wall — the group headings are
 * what make it scannable, and the surface people want is nearly always the
 * first thing they are choosing by.
 */
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/base/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EDITOR_THEMES, THEME_GROUPS, type EditorTheme } from "@/lib/editor-themes";

function Swatch({ colors }: { colors: [string, string, string] }) {
  return (
    <span className="flex items-center gap-px" aria-hidden>
      {colors.map((color, index) => (
        <span
          key={index}
          className="size-2.5 rounded-[3px] border border-black/20"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}

interface ThemeMenuProps {
  theme: EditorTheme;
  onThemeChange: (id: string) => void;
}

export function ThemeMenu({ theme, onThemeChange }: ThemeMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Тема: ${theme.label}`}
          className="gap-1.5 border-[var(--jf-hairline)] bg-[var(--jf-pane-bg)] text-[var(--jf-ink)] hover:bg-[color-mix(in_srgb,var(--jf-ink)_12%,transparent)] hover:text-[var(--jf-ink)]"
        >
          <Swatch colors={theme.swatch} />
          <span className="hidden md:inline">{theme.label}</span>
          <ChevronDown className="size-4 opacity-80" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      {/* Capped height so the list scrolls instead of running off a laptop screen. */}
      <DropdownMenuContent align="end" className="max-h-[70vh] min-w-[220px] overflow-y-auto">
        <DropdownMenuLabel className="flex items-baseline justify-between gap-4">
          <span>Тема</span>
          <span className="text-xs font-normal opacity-60">{EDITOR_THEMES.length} тем</span>
        </DropdownMenuLabel>

        {THEME_GROUPS.map((group, groupIndex) => (
          <div key={group.surface}>
            {groupIndex > 0 ? <DropdownMenuSeparator /> : null}
            <DropdownMenuLabel className="text-xs font-normal opacity-60">
              {group.surface === "dark" ? "Тёмные" : "Светлые"}
            </DropdownMenuLabel>
            {group.themes.map((entry) => (
              <DropdownMenuItem
                key={entry.id}
                onSelect={() => onThemeChange(entry.id)}
                className="h-11 gap-2 md:h-9"
              >
                <Swatch colors={entry.swatch} />
                <span className="flex-1">{entry.label}</span>
                {entry.id === theme.id ? <Check className="size-4" aria-hidden /> : null}
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
