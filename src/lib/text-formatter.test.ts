import { describe, expect, it } from "vitest";
import { formatPlainText, usesPlainText } from "./text-formatter";
import { parseDocument } from "./parse";

describe("console plain text", () => {
  it("joins console-wrapped prose without changing words, figures or punctuation", () => {
    expect(formatPlainText("▎ When a transformer is trained from scratch on corpora that solve the same mathematical problem both correctly and incorrectly, which solution\n▎ does it prefer? The usual test is pairwise, and it is not neutral: when the error can take several forms, a model that merely reproduces training\n▎ frequencies wins it without preferring anything.")).toBe("When a transformer is trained from scratch on corpora that solve the same mathematical problem both correctly and incorrectly, which solution does it prefer? The usual test is pairwise, and it is not neutral: when the error can take several forms, a model that merely reproduces training frequencies wins it without preferring anything.");
    expect(formatPlainText("▎ 59.0% ± 0.8%\n▎ (418M–3.08B), not falsehood as such.")).toBe("59.0% ± 0.8% (418M–3.08B), not falsehood as such.");
  });
  it("keeps every blank line as a paragraph break, including inside console frames", () => {
    expect(formatPlainText("Первый.\n\nВторой.")).toBe("Первый.\n\nВторой.");
    expect(formatPlainText("Первый.\n\n\nВторой.")).toBe("Первый.\n\n\nВторой.");
    expect(formatPlainText("▎ Первый.\n\n▎ Второй.")).toBe("Первый.\n\nВторой.");
    expect(formatPlainText("▎ Первый.\n\n\n▎ Второй.")).toBe("Первый.\n\n\nВторой.");
  });
  it("preserves real paragraphs", () => {
    expect(formatPlainText("Первая строка\nпродолжение.\n\nВторой абзац.")).toBe("Первая строка продолжение.\n\nВторой абзац.");
    expect(formatPlainText("▎ Первый абзац.\n▎\n▎ Второй абзац.")).toBe("Первый абзац.\n\nВторой абзац.");
  });
  it("removes terminal colors, box edges and fences", () => {
    expect(formatPlainText("```text\r\n┌────┐\r\n│ \x1b[32mПривет\x1b[0m │\r\n│ мир │\r\n└────┘\r\n```")).toBe("Привет мир");
  });
  it("auto-detects prose without bypassing JSON validation", () => {
    expect(usesPlainText("▎ Hello\n\n▎ world", "auto", parseDocument("▎ Hello\n\n▎ world"))).toBe(true);
    for (const source of ['текст {"a":1}', '{"a":', '{"a":1}']) {
      expect(usesPlainText(source, "auto", parseDocument(source))).toBe(false);
    }
    expect(usesPlainText("ordinary text", "json", parseDocument("ordinary text", "json"))).toBe(false);
    expect(usesPlainText("a [reference]", "text", parseDocument("a [reference]"))).toBe(true);
  });
});