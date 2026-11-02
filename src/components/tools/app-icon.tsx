import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AppIconProps {
  /** The glyph — pass a Tabler/Lucide icon sized ~78 (e.g. `<IconPackages size={78} />`). */
  icon: ReactNode;
  /** Drop the chiclet shape (no fill/radius/shadow) — just the white glyph, e.g. on a colored hero. */
  bare?: boolean;
  className?: string;
}

/**
 * App icon — the chiclet: a 100×100 tile holding a ~78px white glyph. Every
 * template app leads its landing with one, the golden standard "an app always
 * has an icon". Default is a brand-gradient squircle with a soft lift; `bare`
 * drops the shape (transparent) for a plain white logo on a colored hero.
 */
export function AppIcon({ icon, bare = false, className }: AppIconProps) {
  return (
    <div
      className={cn(
        "flex h-[100px] w-[100px] items-center justify-center text-white",
        !bare && "brand-gradient rounded-[22px] shadow-lg",
        className,
      )}
    >
      {icon}
    </div>
  );
}
