/**
 * JSON → CSV flattener for the CSV tab.
 *
 * A root array of objects becomes a header row + data rows, with nested keys
 * dot-flattened (e.g. `systems.power`) and values quoted per RFC 4180. Any other
 * root — including the seed document, whose root is an object — returns the
 * plain-English guidance message. (The seed therefore demonstrates the
 * non-tabular message by design.)
 */
import type { DocumentResult, JsonValue } from "./parse";

export const CSV_NON_TABULAR = "Для CSV нужен массив объектов. Поместите записи в массив […].";

export type CsvResult = { ok: true; text: string } | { ok: false; message?: string };

/** RFC 4180 field quoting. */
function csvField(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function stringifyCell(value: JsonValue): string {
  if (value === null) return "";
  if (typeof value === "object") return JSON.stringify(value); // nested array / leftover object
  return String(value);
}

/** Flatten one row object into dot-keyed cells. */
function flattenRow(value: JsonValue, prefix: string, out: Record<string, string>): void {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${key}` : key;
      flattenRow(child, path, out);
    }
  } else {
    out[prefix] = stringifyCell(value);
  }
}

/** CSV tab derivation. */
export function emitCsv(result: DocumentResult): CsvResult {
  if (result.status !== "valid") return { ok: false };
  const { value } = result;
  if (!Array.isArray(value)) return { ok: false, message: CSV_NON_TABULAR };

  const rows = value.map((item) => {
    const flat: Record<string, string> = {};
    if (item !== null && typeof item === "object" && !Array.isArray(item)) {
      flattenRow(item, "", flat);
    } else {
      // Non-object element in a root array → single `value` column.
      flat["value"] = stringifyCell(item);
    }
    return flat;
  });

  // Preserve first-seen key order across every row.
  const headers: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        headers.push(key);
      }
    }
  }

  const lines = [headers.map(csvField).join(",")];
  for (const row of rows) {
    lines.push(headers.map((key) => csvField(row[key] ?? "")).join(","));
  }
  return { ok: true, text: lines.join("\n") };
}
