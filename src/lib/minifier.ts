/**
 * Token-stream JSON minifier for the Minified tab.
 *
 * Emits each token's verbatim source lexeme with no whitespace between them —
 * same lexeme-fidelity guarantee as the formatter (64-bit integers preserved).
 */
import type { DocumentResult, JsonToken } from "./parse";

/** Re-print a token stream with no whitespace. */
export function reprintTokensCompact(tokens: JsonToken[], source: string): string {
  let out = "";
  for (const token of tokens) {
    out += source.slice(token.range[0], token.range[1]);
  }
  return out;
}

export interface MinifyResult {
  text: string;
  originalBytes: number;
  minifiedBytes: number;
}

/** Minified tab derivation — returns the compact text plus a byte-reduction stat. */
export function minifyDocument(result: DocumentResult): MinifyResult | null {
  if (result.status !== "valid") return null;
  const text = reprintTokensCompact(result.tokens, result.source);
  return {
    text,
    originalBytes: new TextEncoder().encode(result.source).length,
    minifiedBytes: new TextEncoder().encode(text).length,
  };
}
