/**
 * The gray byte-size Badge shown in the output tab bar on the five content tabs
 * (Formatted, Minified, XML, CSV, YAML). Metadata, not an action.
 */
import { Badge } from "@/components/base/badge";

/** Human-readable byte size: `343 B`, `1.4 KB`, `2.0 MB`. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

/** Count the UTF-8 byte length of a string. */
export function byteLength(text: string): number {
  return new TextEncoder().encode(text).length;
}

interface ByteBadgeProps {
  bytes: number;
}

export function ByteBadge({ bytes }: ByteBadgeProps) {
  return (
    <Badge color="gray" className="font-mono tabular-nums">
      {formatBytes(bytes)}
    </Badge>
  );
}
