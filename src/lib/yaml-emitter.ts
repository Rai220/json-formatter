/**
 * JSON → YAML emitter for the YAML tab. Hand-rolled block-style emitter.
 *
 * Scalar quoting is explicit: strings that look like numbers, booleans, null, or
 * contain `: # [ ] { }` or leading/trailing whitespace are double-quoted;
 * everything else is bare.
 */
import type { DocumentResult, JsonValue } from "./parse";

const INDENT = "  ";

function needsQuote(value: string): boolean {
  if (value === "") return true;
  if (/^\s|\s$/.test(value)) return true;
  if (/[:#[\]{}]/.test(value)) return true;
  if (/^(true|false|null|~)$/i.test(value)) return true;
  // number-like (int, float, exponent)
  if (/^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/.test(value)) return true;
  // YAML indicator characters at the start
  if (/^[!&*?|>%@`"',#-]/.test(value)) return true;
  return false;
}

function scalar(value: JsonValue): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return String(value);
  const text = String(value);
  return needsQuote(text) ? JSON.stringify(text) : text;
}

function isEmptyContainer(value: JsonValue): string | null {
  if (Array.isArray(value)) return value.length === 0 ? "[]" : null;
  if (value !== null && typeof value === "object") return Object.keys(value).length === 0 ? "{}" : null;
  return null;
}

function emitObject(obj: { [key: string]: JsonValue }, depth: number): string[] {
  const pad = INDENT.repeat(depth);
  const lines: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const label = needsQuote(key) ? JSON.stringify(key) : key;
    const empty = isEmptyContainer(value);
    if (empty) {
      lines.push(`${pad}${label}: ${empty}`);
    } else if (value !== null && typeof value === "object") {
      lines.push(`${pad}${label}:`);
      lines.push(...emitAny(value, depth + 1));
    } else {
      lines.push(`${pad}${label}: ${scalar(value)}`);
    }
  }
  return lines;
}

function emitArray(arr: JsonValue[], depth: number): string[] {
  const pad = INDENT.repeat(depth);
  const childPad = INDENT.repeat(depth + 1);
  const lines: string[] = [];
  for (const item of arr) {
    const empty = isEmptyContainer(item);
    if (empty) {
      lines.push(`${pad}- ${empty}`);
    } else if (item !== null && typeof item === "object") {
      const sub = emitAny(item, depth + 1);
      // Hoist the item's first line onto the `- ` marker.
      lines.push(`${pad}- ${sub[0].slice(childPad.length)}`);
      lines.push(...sub.slice(1));
    } else {
      lines.push(`${pad}- ${scalar(item)}`);
    }
  }
  return lines;
}

function emitAny(value: JsonValue, depth: number): string[] {
  if (Array.isArray(value)) return emitArray(value, depth);
  if (value !== null && typeof value === "object") return emitObject(value, depth);
  return [INDENT.repeat(depth) + scalar(value)];
}

/** YAML tab derivation. Returns the YAML text, or an empty string when not valid. */
export function emitYaml(result: DocumentResult): string {
  if (result.status !== "valid") return "";
  const { value } = result;
  const empty = isEmptyContainer(value);
  if (empty) return empty;
  if (value === null || typeof value !== "object") return scalar(value);
  return emitAny(value, 0).join("\n");
}
