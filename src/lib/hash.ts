/**
 * URL-hash share encode/decode for the JSON Formatter.
 *
 * The document is compressed with lz-string into the URL hash — the link IS the
 * document. This is deliberately NOT the starter's `useUrlState` hook (that is
 * for query-param UI state); Share carries compressed document content instead.
 */
import LZString from "lz-string";
import { HASH_CAP_BYTES } from "@/data/seed";

/**
 * Decode a location hash into document text, or `null` if absent/undecodable.
 *
 * The hash is untrusted input from whoever crafted the link, so it is rejected
 * above the same size cap Share enforces (and the decoded text above a 5 MB
 * ceiling matching the upload limit) rather than decompressed unbounded.
 */
const MAX_DECODED_CHARS = 5 * 1024 * 1024;

export function decodeHash(hash: string): string | null {
  const encoded = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!encoded) return null;
  if (encoded.length > HASH_CAP_BYTES) return null;
  try {
    const text = LZString.decompressFromEncodedURIComponent(encoded);
    if (!text || text.length === 0) return null;
    return text.length > MAX_DECODED_CHARS ? null : text;
  } catch {
    return null;
  }
}

export type EncodeResult = { ok: true; url: string; hash: string } | { ok: false; tooLarge: true };

/**
 * Compress `text` into an encoded hash and build the shareable URL. The size cap
 * is measured on the ENCODED string (~50 KB); over the cap Share falls back to a
 * toast instead of writing an unusable URL.
 *
 * Preserve the page path, including GitHub Pages repository subdirectories.
 */
export function encodeShare(text: string, pageUrl: string): EncodeResult {
  const encoded = LZString.compressToEncodedURIComponent(text);
  if (new TextEncoder().encode(encoded).length > HASH_CAP_BYTES) {
    return { ok: false, tooLarge: true };
  }
  const url = new URL(pageUrl);
  url.hash = encoded;
  return { ok: true, url: url.href, hash: encoded };
}
