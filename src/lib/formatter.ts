/**
 * Token-stream JSON pretty-printer for the Formatted tab.
 *
 * Re-prints from the momoa token stream — NEVER `JSON.parse` + `JSON.stringify`.
 * A round-trip through native JSON silently rounds 64-bit integers
 * (`9007199254740993` → `…992`), which is unacceptable in a JSON tool. Emitting
 * each token's verbatim source lexeme preserves numbers exactly.
 */
import type { DocumentResult, JsonToken } from "./parse";

export type IndentWidth = 2 | 3 | 4;

/** Re-print a token stream at the given indent width. */
export function reprintTokens(tokens: JsonToken[], source: string, indentWidth: IndentWidth): string {
  let out = "";
  let depth = 0;
  const pad = (d: number) => "\n" + " ".repeat(d * indentWidth);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const text = source.slice(token.range[0], token.range[1]);
    const next = tokens[i + 1];
    const prev = tokens[i - 1];

    switch (token.type) {
      case "LBrace":
      case "LBracket": {
        const close = token.type === "LBrace" ? "RBrace" : "RBracket";
        if (next && next.type === close) {
          out += text; // empty container → keep on one line
          break;
        }
        depth++;
        out += text + pad(depth);
        break;
      }
      case "RBrace":
      case "RBracket": {
        const open = token.type === "RBrace" ? "LBrace" : "LBracket";
        if (prev && prev.type === open) {
          out += text; // empty container closer already emitted inline
          break;
        }
        depth--;
        out += pad(depth) + text;
        break;
      }
      case "Colon":
        out += text + " ";
        break;
      case "Comma":
        out += text + pad(depth);
        break;
      default:
        out += text; // String / Number / Boolean / Null — verbatim lexeme
    }
  }
  return out;
}

/**
 * Formatted tab derivation. Returns the pretty-printed JSON, or an empty string
 * for the `empty`/`invalid` states (the tab renders its one-liner instead).
 */
export function formatDocument(result: DocumentResult, indentWidth: IndentWidth): string {
  if (result.status !== "valid") return "";
  return reprintTokens(result.tokens, result.source, indentWidth);
}
