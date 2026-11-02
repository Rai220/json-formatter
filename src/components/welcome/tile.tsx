import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Feature tile for the welcome page.
 *
 * Every number here was measured off iCloud Mail rather than chosen: the icon
 * is 60×60 with a 14px gap to the heading, the heading is 24/600 and the body
 * 17/400, both at black 88%, and the surface is white at an 11px radius with
 * 40px of padding under a shadow pushed right and down rather than straight
 * below.
 *
 * The thing people miss when copying this: Apple does NOT give each tile its
 * own colour. All seven icons on that page share one gradient and only the
 * glyph changes, which is why a wall of tiles reads as calm. Ours uses the
 * app's own tint in place of Apple's blue — see `TileIconGradient`.
 */

const LABEL = "var(--w-label)";

/** The id the tile icons paint with. */
export const TILE_ICON_FILL = "url(#tile-icon-gradient)";

/**
 * Renders the gradient the tile icons reference. Mount once per page.
 *
 * An SVG `fill` can point at a gradient defined anywhere in the same document,
 * so this sits offscreen and every icon above reaches it by id. Tabler's filled
 * icons put `fill` on the `<svg>` and let the paths inherit, so passing
 * `color={TILE_ICON_FILL}` is all an icon needs.
 */
export function TileIconGradient() {
  return (
    <svg aria-hidden width="0" height="0" className="absolute">
      <defs>
        <linearGradient id="tile-icon-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tint-to)" />
          <stop offset="100%" stopColor="var(--tint-from)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export interface TileProps {
  /** Filled glyph at 60px, painted with `TILE_ICON_FILL`. Filled, not outline —
   *  a stroked icon goes wiry at this size next to a 24px heading. */
  icon: ReactNode;
  heading: string;
  children: ReactNode;
  /** Optional visual below the text (a mock, a set of chips). */
  visual?: ReactNode;
  /** Let the paragraph run wide. A full-bleed tile with a 46ch measure leaves
   *  two thirds of itself empty — iCloud's full-width tile runs nearly edge to
   *  edge, and so should ours. */
  wide?: boolean;
  className?: string;
}

export function Tile({ icon, heading, children, visual, wide = false, className }: TileProps) {
  return (
    <div
      className={cn("flex flex-col p-6 sm:p-10", className)}
      style={{
        backgroundColor: "var(--w-surface)",
        borderRadius: 11,
        boxShadow: "var(--w-tile-shadow)",
        border: "var(--w-tile-border)",
      }}
    >
      <span aria-hidden className="flex h-[60px] w-[60px] shrink-0 items-center justify-center">
        {icon}
      </span>

      <h2 className="mt-[14px] text-[24px] font-semibold leading-[28px]" style={{ color: LABEL }}>
        {heading}
      </h2>

      <p
        className={cn("mt-2 text-[17px] leading-[25px]", wide ? "max-w-[92ch]" : "max-w-[46ch]")}
        style={{ color: LABEL }}
      >
        {children}
      </p>

      {visual ? <div className="mt-8 min-h-0 flex-1">{visual}</div> : null}
    </div>
  );
}
