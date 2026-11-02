import { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export interface CalcCanvasProps {
  /** Product name shown in the sticky top bar. */
  appName: string;
  /** Icon rendered left of the name (a Tabler icon). */
  icon?: ReactNode;
  /**
   * Right-aligned top-bar actions — varies by tool (a Share button for a
   * single-page calc, a Reset link for a wizard). Wire Share to
   * `useUrlState().copyShareLink`.
   */
  actions?: ReactNode;
  /**
   * Identity tint (one of the names in `tints.css`: green/crimson/plum/indigo/
   * azure/teal). Sets `data-tint`; the canvas fills `var(--tint-gradient)`.
   */
  tint?: string;
  children: ReactNode;
  className?: string;
  /** When set, the wordmark links here (e.g. back to the welcome page). */
  homeHref?: string;
  /** Rendered first in tab order, before the header (a "Skip to…" link). */
  skipLink?: ReactNode;
}

/**
 * Full-bleed calculator page host — the calculator equivalent of `CardCanvas`.
 * Fills the chosen identity-tint gradient with white on-canvas text and hosts
 * frosted `.card-tonal` panels that lift off it. A minimal sticky top bar
 * carries the wordmark + a per-tool `actions` slot. Unlike `CardCanvas` (a
 * centered single card), this is a scrolling multi-panel layout for an input
 * panel + live outputs, or a `StepFlow` wizard. No context — panels read the
 * tint tokens directly.
 */
export function CalcCanvas({ appName, icon, actions, tint = "green", children, className, homeHref, skipLink }: CalcCanvasProps) {
  return (
    <div data-tint={tint} className="min-h-dvh w-full text-white" style={{ backgroundImage: "var(--tint-gradient)" }}>
      {skipLink}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 px-3 backdrop-blur-[14px] sm:px-6" style={{ backgroundColor: "color-mix(in srgb, var(--tint-from) 72%, transparent)" }}>
        {homeHref ? (
          <Link to={homeHref} aria-label={`${appName} home`} className="flex min-w-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            {icon}
            <h1 className="truncate text-[17px] font-semibold tracking-tight">{appName}</h1>
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            {icon}
            <h1 className="truncate text-[17px] font-semibold tracking-tight">{appName}</h1>
          </div>
        )}
        {actions ? <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">{actions}</div> : null}
      </header>

      <main className={cn("mx-auto flex w-full max-w-3xl flex-col gap-5 px-6 py-10", className)}>
        {children}
      </main>
    </div>
  );
}
