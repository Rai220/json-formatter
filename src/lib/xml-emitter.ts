/**
 * JSON → XML emitter for the XML tab.
 *
 * - Wraps the document in a single `<root>` element.
 * - Text values escape `& < > " '`.
 * - Object keys that are not valid XML element names (spaces, leading digits,
 *   symbols) render as `<item name="the key">…</item>`.
 * - Array elements render as repeated `<item>` children.
 */
import type { DocumentResult, JsonValue } from "./parse";

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** A key is a valid XML element name only if it matches this and isn't `xml*`. */
function isValidElementName(key: string): boolean {
  return /^[A-Za-z_][\w.-]*$/.test(key) && !/^xml/i.test(key);
}

function scalarText(value: JsonValue): string {
  if (value === null) return "";
  if (typeof value === "string") return escapeText(value);
  return String(value);
}

function emitElement(tag: string, attr: string, value: JsonValue, depth: number): string {
  const indent = "  ".repeat(depth);
  const open = `<${tag}${attr}>`;
  const close = `</${tag}>`;

  if (Array.isArray(value)) {
    if (value.length === 0) return `${indent}${open}${close}`;
    const kids = value.map((child) => emitElement("item", "", child, depth + 1)).join("\n");
    return `${indent}${open}\n${kids}\n${indent}${close}`;
  }

  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length === 0) return `${indent}${open}${close}`;
    const kids = keys
      .map((key) =>
        isValidElementName(key)
          ? emitElement(key, "", value[key], depth + 1)
          : emitElement("item", ` name="${escapeText(key)}"`, value[key], depth + 1),
      )
      .join("\n");
    return `${indent}${open}\n${kids}\n${indent}${close}`;
  }

  return `${indent}${open}${scalarText(value)}${close}`;
}

/** XML tab derivation. Returns the XML text, or an empty string when not valid. */
export function emitXml(result: DocumentResult): string {
  if (result.status !== "valid") return "";
  return emitElement("root", "", result.value, 0);
}
