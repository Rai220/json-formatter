/**
 * The shared parse step for the JSON Formatter (`/`).
 *
 * Runs the `@humanwhocodes/momoa` tokenizer ONCE per document change and returns
 * a `DocumentResult`. Every output tab consumes this result — no tab ever parses
 * the document itself, and no render path ever throws.
 *
 * `momoa` is used deliberately (a recorded deviation from the idea doc's
 * "no external dependency" line): it yields a token stream with source ranges
 * (enabling lossless re-printing that preserves 64-bit integers) and structured
 * errors carrying exact line/column positions (powering the caret-style report).
 */
import { parse, evaluate } from "@humanwhocodes/momoa";
import { jsonrepair } from "jsonrepair";
import { diffChars } from "diff";

/** A parsed JSON value (numbers may be rounded — value consumers don't need lexeme fidelity). */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** One lexical token with its source range — everything Format/Minify need. */
export interface JsonToken {
  type: string;
  range: [number, number];
  loc: { start: { line: number; column: number; offset: number }; end: { line: number; column: number; offset: number } };
}

/** A structured, positioned parse error for the Problems tab. */
export interface ParseReport {
  line: number;
  column: number;
  /** The offending source line, left-truncated to ~60 chars (with a leading `...`). */
  context: string;
  /** Column position within `context` for the `^` caret line. */
  caretOffset: number;
  /** The tokenizer's message, e.g. "Unexpected token ',' at line 4, column 24". */
  message: string;
}

export type InputFormat = "auto" | "json" | "jsonl";
export type ValidDocument = { status: "valid"; value: JsonValue; tokens: JsonToken[]; source: string; records?: ValidDocument[]; extracted?: boolean;
  /** Errors found in the original text that were auto-fixed (positions refer to the input). */
  issues?: ParseReport[] };
export type DocumentResult =
  | { status: "empty" }
  | { status: "invalid"; report: ParseReport }
  | ValidDocument;

/** momoa token-type → the friendly lexeme shown in the error message. */
const FRIENDLY: Record<string, string> = {
  LBrace: "'{'",
  RBrace: "'}'",
  LBracket: "'['",
  RBracket: "']'",
  Colon: "':'",
  Comma: "','",
  String: "строка",
  Number: "число",
  Boolean: "логическое значение",
  Null: "null",
  EOF: "конец ввода",
};

const MAX_CONTEXT = 60;

/** Turn momoa's raw message + position into the human report string. */
function humanize(rawMsg: string, line: number, column: number): string {
  const core = rawMsg
    .replace(/\s*\(\d+:\d+\)\s*$/, "")
    .replace(/\s*found\.?\s*$/, "")
    .replace(
      /\b(LBrace|RBrace|LBracket|RBracket|Colon|Comma|String|Number|Boolean|Null|EOF)\b/g,
      (m) => FRIENDLY[m] ?? m,
    );
  const translated = core
    .replace(/Unexpected token/gi, "Неожиданный символ")
    .replace(/Unexpected character/gi, "Неожиданный символ")
    .replace(/Unexpected identifier/gi, "Неожиданное имя")
    .replace(/Unexpected end of input/gi, "Неожиданный конец ввода")
    .replace(/Expected/gi, "Ожидалось")
    .replace(/Invalid/gi, "Некорректное значение:")
    .replace(/Unterminated string/gi, "Незакрытая строка");
  return `${translated} — строка ${line}, столбец ${column}`;
}

/** Build the caret context window for a given line/column of `source`. */
function buildContext(source: string, line: number, column: number): { context: string; caretOffset: number } {
  const lines = source.split("\n");
  const raw = lines[line - 1] ?? "";
  let context = raw;
  let caretOffset = Math.max(0, column - 1);

  if (context.length > MAX_CONTEXT) {
    const start = Math.max(0, caretOffset - 40);
    context = (start > 0 ? "... " : "") + context.slice(start, start + MAX_CONTEXT);
    caretOffset = (start > 0 ? 4 : 0) + (caretOffset - start);
  }
  caretOffset = Math.min(caretOffset, context.length);
  return { context, caretOffset };
}

/** Extract a positioned report from a momoa parse error. */
function extractReport(error: unknown, source: string): ParseReport {
  const rawMsg = error instanceof Error ? error.message : String(error);
  const match = rawMsg.match(/\((\d+):(\d+)\)\s*$/);
  const line = match ? Number(match[1]) : 1;
  const column = match ? Number(match[2]) : 1;
  const { context, caretOffset } = buildContext(source, line, column);
  return { line, column, context, caretOffset, message: humanize(rawMsg, line, column) };
}

/**
 * Parse a document. Pure and synchronous — never throws. Callers memoize this by
 * referential equality of `text` (every CodeMirror `onChange` yields a new string).
 */
function parseSingle(text: string): DocumentResult {
  if (text.trim() === "") return { status: "empty" };
  try {
    const ast = parse(text, { mode: "json", ranges: true, tokens: true }) as unknown as {
      tokens: JsonToken[];
    };
    return {
      status: "valid",
      value: evaluate(ast as never) as JsonValue,
      tokens: ast.tokens,
      source: text,
    };
  } catch (error) {
    return { status: "invalid", report: extractReport(error, text) };
  }
}

/** Shift a report found in a slice so its position points into the full input. */
function shiftReport(report: ParseReport, full: string, sliceStart: number): ParseReport {
  const before = full.slice(0, sliceStart);
  const lineOffset = before.split("\n").length - 1;
  const colOffset = report.line === 1 ? sliceStart - (before.lastIndexOf("\n") + 1) : 0;
  const line = report.line + lineOffset;
  const column = report.column + colOffset;
  const { context, caretOffset } = buildContext(full, line, column);
  const message = report.message.replace(/ — строка \d+, столбец \d+$/, "");
  return { line, column, context, caretOffset, message: `${message} — строка ${line}, столбец ${column}` };
}

/**
 * Strict parse; on failure try an automatic repair (quotes, missing/trailing
 * commas, unquoted keys, comments, …). The original error is kept as an issue.
 */
const MAX_DIFF_CHARS = 50_000;

function show(fragment: string): string {
  const visible = fragment.replace(/\n/g, "↵").trim() || "пробел";
  return `«${visible.length > 20 ? visible.slice(0, 20) + "…" : visible}»`;
}

/** Describe every repair as a positioned issue (one per source line). */
function describeRepairs(original: string, repaired: string): ParseReport[] {
  const parts = diffChars(original, repaired);
  const byLine = new Map<number, { column: number; notes: string[] }>();
  let offset = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.added && !part.removed) {
      offset += part.value.length;
      continue;
    }
    let note: string;
    const next = parts[i + 1];
    if (part.removed && next?.added) {
      note = `${show(part.value)} заменено на ${show(next.value)}`;
      i++;
    } else if (part.removed) {
      note = `удалено лишнее ${show(part.value)}`;
    } else {
      note = `добавлено недостающее ${show(part.value)}`;
    }
    const before = original.slice(0, offset);
    const line = before.split("\n").length;
    const column = offset - (before.lastIndexOf("\n") + 1) + 1;
    const entry = byLine.get(line) ?? { column, notes: [] };
    entry.notes.push(note);
    byLine.set(line, entry);
    if (part.removed) offset += part.value.length;
  }
  return [...byLine.entries()].map(([line, { column, notes }]) => {
    const { context, caretOffset } = buildContext(original, line, column);
    const counts = new Map<string, number>();
    for (const note of notes) counts.set(note, (counts.get(note) ?? 0) + 1);
    const text = [...counts].map(([note, n]) => (n > 1 ? `${note} (×${n})` : note)).join("; ");
    return { line, column, context, caretOffset,
      message: `${text.charAt(0).toUpperCase()}${text.slice(1)} — строка ${line}, столбец ${column}` };
  });
}

function parseOrRepair(text: string): DocumentResult {
  const strict = parseSingle(text);
  if (strict.status !== "invalid") return strict;
  try {
    const fixedText = jsonrepair(text);
    const repaired = parseSingle(fixedText);
    if (repaired.status === "valid") {
      const described = text.length <= MAX_DIFF_CHARS ? describeRepairs(text, fixedText) : [];
      return { ...repaired, issues: described.length ? described : [strict.report] };
    }
  } catch {
    /* not repairable */
  }
  return strict;
}

function combineRecords(records: ValidDocument[], extracted = false): DocumentResult {
  const combined = parseSingle(`[${records.map((record) => record.source.trim()).join(",\n")}]`);
  const issues = records.flatMap((record) => record.issues ?? []);
  return combined.status === "valid"
    ? { ...combined, records, extracted, ...(issues.length ? { issues } : {}) }
    : combined;
}

function parseLines(text: string): DocumentResult {
  const records: ValidDocument[] = [];
  const lines = text.split(/\r?\n/);
  for (let index = 0; index < lines.length; index++) {
    if (!lines[index].trim()) continue;
    const record = /^\s*[[{]/.test(lines[index]) ? parseOrRepair(lines[index]) : parseSingle(lines[index]);
    if (record.status === "valid" && record.issues) {
      record.issues = record.issues.map((issue) => {
        const { context, caretOffset } = buildContext(text.replace(/\r/g, ""), index + 1, issue.column);
        return { ...issue, line: index + 1, context, caretOffset,
          message: issue.message.replace(/строка \d+/, `строка ${index + 1}`) };
      });
    }
    if (record.status === "invalid") {
      const report = record.report;
      return { status: "invalid", report: { ...report, line: index + 1,
        message: humanize("Некорректная запись JSONL", index + 1, report.column) } };
    }
    if (record.status === "valid") records.push(record);
  }
  return records.length ? combineRecords(records) : { status: "empty" };
}

/** Scan complete outer containers, honoring quoted braces and escaped quotes. */
function extractContainers(text: string): ValidDocument[] {
  const records: ValidDocument[] = [];
  let start = -1;
  let quoted = false;
  let escaped = false;
  const stack: string[] = [];
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (start < 0) {
      if (char !== "{" && char !== "[") continue;
      start = index;
      stack.push(char);
      continue;
    }
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === "{" || char === "[") stack.push(char);
    else if (char === "}" || char === "]") {
      const open = stack.pop();
      if ((char === "}" && open !== "{") || (char === "]" && open !== "[")) {
        stack.length = 0;
        start = -1;
        continue;
      }
      if (!stack.length) {
        const record = parseOrRepair(text.slice(start, index + 1));
        if (record.status === "valid") {
          const sliceStart = start;
          if (record.issues) record.issues = record.issues.map((issue) => shiftReport(issue, text, sliceStart));
          records.push(record);
        }
        start = -1;
      }
    }
  }
  return records;
}

/** Auto accepts strict JSON, JSONL, or complete objects/arrays embedded in prose. */
export function parseDocument(text: string, format: InputFormat = "auto"): DocumentResult {
  if (format === "jsonl") return parseLines(text);
  const strict = parseSingle(text);
  if (strict.status !== "invalid") return strict;
  if (format === "json") return parseOrRepair(text);
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length > 1) {
    const jsonl = parseLines(text);
    if (jsonl.status === "valid") return jsonl;
    // Do not lose malformed rows from a likely JSONL document.
    if (lines.every((line) => /^\s*[\[{]/.test(line)) && lines.some((line) => parseSingle(line).status === "valid")) return jsonl;
  }
  // Whole text looks like one (broken) JSON document — repair it as a unit.
  if (/^\s*[\[{]/.test(text) && /[\]}]\s*$/.test(text)) {
    const repaired = parseOrRepair(text);
    if (repaired.status === "valid") return repaired;
  }
  const records = extractContainers(text);
  if (!records.length) return strict;
  if (records.length === 1) return { ...records[0], extracted: true };
  return combineRecords(records, true);
}
