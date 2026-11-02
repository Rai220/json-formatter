import { describe, expect, it } from "vitest";
import { parseDocument } from "./parse";
import { formatDocument } from "./formatter";
import { emitJsonl } from "./jsonl";

describe("local JSON and JSONL processing", () => {
  it("removes text surrounding JSON", () => {
    const result = parseDocument('Ответ: ```json\n{"name":"Иван"}\n``` конец');
    expect(formatDocument(result, 2)).toBe('{\n  "name": "Иван"\n}');
  });
  it("keeps all embedded documents in their original order", () => {
    const result = parseDocument('начало {"a":1} между [2,3] конец {"b":4}');
    expect(result.status === "valid" && result.value).toEqual([{ a: 1 }, [2, 3], { b: 4 }]);
  });
  it("honors brackets and escaped quotes inside strings", () => {
    const json = JSON.stringify({ text: 'скобки } [ и "кавычки"', nested: { a: 1 } });
    const result = parseDocument(`текст ${json} конец`);
    expect(result.status === "valid" && result.value).toEqual(JSON.parse(json));
  });
  it("accepts JSONL with CRLF and blank lines", () => {
    const result = parseDocument('{"a":1}\r\n\r\n{"a":2}\r\n');
    expect(emitJsonl(result)).toBe('{"a":1}\n{"a":2}');
    expect(JSON.parse(formatDocument(result, 2))).toEqual([{ a: 1 }, { a: 2 }]);
  });
  it("accepts scalar records in explicit JSONL", () => {
    expect(emitJsonl(parseDocument('null\n"текст"\n42\ntrue', "jsonl"))).toBe('null\n"текст"\n42\ntrue');
  });
  it("reports invalid JSONL rows instead of losing them", () => {
    for (const mode of ["auto", "jsonl"] as const) {
      const result = parseDocument('{"a":1}\n{"b":}\n{"c":3}', mode);
      expect(result.status).toBe("invalid");
      expect(result.status === "invalid" && result.report.line).toBe(2);
    }
  });
  it("preserves large integers when extracting and emitting JSONL", () => {
    const result = parseDocument('текст {"id":9007199254740993} и {"id":9007199254740995}');
    expect(emitJsonl(result)).toBe('{"id":9007199254740993}\n{"id":9007199254740995}');
    expect(formatDocument(result, 2)).toContain('9007199254740993');
  });
  it("converts a JSON array to individual JSONL records", () => {
    expect(emitJsonl(parseDocument('[{"id":9007199254740993},[1,2],"a",null]'))).toBe('{"id":9007199254740993}\n[1,2]\n"a"\nnull');
    expect(emitJsonl(parseDocument('[]'))).toBe("");
  });
  it("does not salvage nested JSON from an invalid outer object", () => {
    expect(parseDocument('{"a":{},"b":}').status).toBe("invalid");
  });
});