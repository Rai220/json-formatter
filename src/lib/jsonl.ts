import type { DocumentResult } from "./parse";
import { parseDocument } from "./parse";
import { reprintTokensCompact } from "./minifier";

/** Emit one compact record per line without rounding number lexemes. */
export function emitJsonl(result: DocumentResult): string {
  if (result.status !== "valid") return "";
  if (result.records) return result.records.map((record) => reprintTokensCompact(record.tokens, record.source)).join("\n");
  if (!Array.isArray(result.value)) return reprintTokensCompact(result.tokens, result.source);
  const records: string[] = [];
  let depth = 0;
  let start = result.tokens[0]?.range[1] ?? 0;
  for (const token of result.tokens) {
    if (token.type === "Comma" && depth === 1 || token.type === "RBracket" && depth === 1) {
      const record = parseDocument(result.source.slice(start, token.range[0]), "json");
      if (record.status === "valid") records.push(reprintTokensCompact(record.tokens, record.source));
      start = token.range[1];
    }
    if (token.type === "LBrace" || token.type === "LBracket") depth++;
    if (token.type === "RBrace" || token.type === "RBracket") depth--;
  }
  return records.join("\n");
}