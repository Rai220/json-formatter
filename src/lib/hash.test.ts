import { describe, it, expect } from "vitest";
import { decodeHash, encodeShare } from "./hash";

describe("share hash", () => {
  it("round-trips a document at a GitHub Pages repository path", () => {
    const r = encodeShare('{"a":1}', "https://x.test/json-tool/");
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.url).toBe(`https://x.test/json-tool/#${r.hash}`);
      expect(decodeHash("#" + r.hash)).toBe('{"a":1}');
    }
  });
  it("rejects garbage", () => {
    expect(decodeHash("#garbage")).toBeNull();
    expect(decodeHash("")).toBeNull();
  });
});
