import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface BrowserFrameProps {
  /** URL shown in the address pill. */
  url?: string;
  /** The "page" — a screenshot or live preview. Falls back to a soft placeholder. */
  children?: ReactNode;
  className?: string;
}

// Measured from a real Chrome window rather than picked: 1728×1023 outer, of
// which the tab strip + address bar are 90px. Keeping the frame on those
// numbers is what stops the mock looking like a squashed 16:9 box.
const WINDOW_W = 1728;
const WINDOW_H = 1023;
const CHROME_H = 90;

/**
 * Browser-chrome preview card — a product screenshot in a faux browser window,
 * for the landing paradigm (sits below the CTA). Styled as the
 * landing tile: 11px radius, soft offset shadow `17px 20px 40px rgba(0,0,0,.16)`,
 * white surface. Responsive width 315 → 478 → 650 caps via `max-width`; drop it
 * under the CTA with `mt-[calc(min(40px,8vw))]`.
 */
export function BrowserFrame({ url = "yourapp.com", children, className }: BrowserFrameProps) {
  return (
    <div
      className={cn("flex w-full flex-col overflow-hidden", className)}
      style={{
        borderRadius: 11,
        backgroundColor: "#ffffff",
        boxShadow: "17px 20px 40px rgba(0,0,0,0.16)",
        aspectRatio: `${WINDOW_W} / ${WINDOW_H}`,
      }}
    >
      {/* chrome bar — the real proportion, with a floor so the dots and the
          address pill still fit once the frame is phone-width. */}
      <div
        className="flex shrink-0 items-center gap-4 px-4"
        style={{
          height: `max(36px, ${((CHROME_H / WINDOW_H) * 100).toFixed(3)}%)`,
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div className="flex shrink-0 items-center gap-2">
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: "#28C840" }} />
        </div>
        <div
          className="flex h-7 min-w-0 flex-1 items-center justify-center truncate rounded-full px-3 text-[13px]"
          style={{ backgroundColor: "var(--w-sunken, rgba(0,0,0,0.05))", color: "var(--w-muted, rgba(0,0,0,0.5))" }}
        >
          {url}
        </div>
      </div>

      {/* page content — whatever height the frame's real proportion leaves */}
      <div className="min-h-0 w-full flex-1 overflow-hidden" style={{ backgroundColor: "var(--w-surface, #ffffff)" }}>
        {children ?? (
          <div
            className="flex h-full w-full items-center justify-center text-sm"
            style={{
              color: "rgba(0,0,0,0.35)",
              backgroundImage: "linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.05))",
            }}
          >
            Your product, right here
          </div>
        )}
      </div>
    </div>
  );
}
