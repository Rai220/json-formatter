import type { DocumentResult, InputFormat } from "./parse";

export type ContentFormat = InputFormat | "text";

/** Remove console presentation without rewriting words or punctuation. */
export function formatPlainText(source: string): string {
  const lines = source.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, "")
    .replace(/\r\n?/g, "\n").split("\n");
  const paragraphs: string[] = [];
  const gaps: number[] = []; // gaps[i] = blank lines between paragraph i-1 and i
  let words: string[] = [];
  let blanks = 0;
  for (const raw of lines) {
    if (/^\s*[┌┐└┘├┤┬┴┼─━╔╗╚╝╠╣╦╩╬═]+\s*$/u.test(raw) || /^\s*(```|~~~)[\w-]*\s*$/.test(raw)) continue;
    const line = raw.replace(/^\s*[▎▏▍▌│┃║]\s?/u, "")
      .replace(/\s*[│┃║]\s*$/u, "").trim().replace(/[\t ]+/g, " ");
    if (line) {
      if (!words.length && paragraphs.length) gaps.push(blanks);
      words.push(line);
      blanks = 0;
    } else {
      // Every blank line — console frame or not — is kept as a paragraph break.
      if (words.length) {
        paragraphs.push(words.join(" "));
        words = [];
      }
      blanks++;
    }
  }
  if (words.length) paragraphs.push(words.join(" "));
  return paragraphs
    .map((text, index) => index === 0 ? text : "\n".repeat((gaps[index - 1] ?? 1) + 1) + text)
    .join("");
}

/** Keep broken JSON on the validator path; explicit text handles ambiguity. */
export function usesPlainText(source: string, mode: ContentFormat, result: DocumentResult): boolean {
  return mode === "text" || (mode === "auto" && result.status === "invalid" && !/[{}\[\]]/.test(source));
}