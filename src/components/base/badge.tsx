import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/**
 * Color-variant Badge wrapper.
 *
 * Badges are metadata, not actions — always a subtle tinted background, never
 * solid-filled (solid = buttons only), never clickable. Import from here, never
 * from `components/ui/badge` directly (per ui-guidelines → Badges).
 *
 * Used by the JSON Formatter's byte-size badge (`gray`) and the Problems tab
 * verdict badge (`green` for "Valid JSON ✓", `red` for parse errors).
 */
export type BadgeColor = "gray" | "blue" | "amber" | "red" | "green" | "purple";

const colorStyles: Record<BadgeColor, string> = {
  gray: "bg-muted text-foreground border-transparent",
  blue: "bg-blue-pastel text-blue-dark border-transparent",
  amber: "bg-yellow-pastel text-orange-dark border-transparent",
  red: "bg-red-pastel text-red-dark border-transparent",
  green: "bg-green-pastel text-green-dark border-transparent",
  purple: "bg-purple-pastel text-purple-dark border-transparent",
};

interface BadgeProps extends ComponentProps<typeof ShadcnBadge> {
  color?: BadgeColor;
}

const Badge = ({ color = "gray", className, ...props }: BadgeProps) => {
  return (
    <ShadcnBadge
      variant="outline"
      className={cn(colorStyles[color], className)}
      {...props}
    />
  );
};

export { Badge };
