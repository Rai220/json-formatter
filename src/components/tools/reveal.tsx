import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /**
   * Reveal on mount instead of waiting for scroll — use for content that's
   * already in view when it renders (e.g. a wizard results step). Default false:
   * the group reveals when it scrolls into the viewport.
   */
  immediate?: boolean;
}

/**
 * Staggered-reveal container. Its `RevealItem` children start hidden — offset per
 * the app's `data-motion` preset (rise / fade / slide / scale / blur) — and
 * cascade in ~80ms apart when the group scrolls into view (or right away with
 * `immediate`). Pure CSS + one `IntersectionObserver`, no animation library;
 * honors `prefers-reduced-motion` via `motion.css`.
 *
 * ```tsx
 * <Reveal className="flex flex-col gap-4">
 *   <RevealItem><ResultHero … /></RevealItem>
 *   <RevealItem><Card … /></RevealItem>
 * </Reveal>
 * ```
 *
 * The per-item stagger comes from CSS (`.reveal:nth-child(n)` in `motion.css`),
 * so `RevealItem`s must be **direct children** of `Reveal` to cascade in order.
 * For per-section scroll reveal, give each section its own `Reveal`. Pick the
 * motion once for the app: `<div data-motion="scale">…</div>`.
 */
export function Reveal({ children, className, immediate = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  // Always paint hidden first: a CSS transition only fires when the value
  // changes *after* a prior painted frame. Starting `true` would paint the
  // resting state on frame one and skip the animation entirely.
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (revealed) return;
    if (immediate) {
      // Double rAF: let the hidden/offset state paint, then flip → transition runs.
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = requestAnimationFrame(() => setRevealed(true));
      });
      return () => cancelAnimationFrame(rafRef.current);
    }
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setRevealed(true);
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [revealed, immediate]);

  return (
    <div ref={ref} className={cn("reveal-group", className)} data-revealed={revealed ? "true" : undefined}>
      {children}
    </div>
  );
}

export interface RevealItemProps {
  children: ReactNode;
  className?: string;
}

/**
 * One item inside a `Reveal` — reveals in sequence per the app's motion preset.
 * Must be a direct child of `Reveal`; the stagger order is its position among
 * siblings (CSS `nth-child`).
 */
export function RevealItem({ children, className }: RevealItemProps) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
