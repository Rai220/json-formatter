/**
 * The picture inside the hero's browser frame: the formatter's own workbench,
 * drawn in the DOM.
 *
 * Every control here exists in the product, because a marketing mock showing
 * buttons the app does not have is a false promise. Checked against source:
 *   - toolbar     → action-bar.tsx renders exactly Format / Minify / Validate
 *                   as primary buttons, plus Sample / Clear / Copy / Share.
 *   - output tabs → output-panel.tsx TABS: Formatted, Minified, XML, CSV,
 *                   YAML, Problems. YAML is a TAB, never a toolbar button.
 *   - byte badge  → byte-badge.tsx prints just `262 B`. There is no combined
 *                   "N lines · N B · valid" readout anywhere in the app.
 *   - line numbers→ both editors build on `basicSetup` from "codemirror",
 *                   which includes lineNumbers(). Real, so shown.
 *   - pane labels → the product has NO visible pane heading. The left pane is
 *                   a section labelled only for screen readers, with an
 *                   Ln/Col footer. No "Input"/"Output" captions, so none here.
 *
 * It also has to FILL the frame: a frame kept honest to a real window
 * (1728×1023) is tall, and a few lines floating in it reads as a broken page.
 */

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const HAIRLINE = "var(--w-hairline)";
const GUTTER = "var(--w-faint)";
const PUNCT = "var(--w-muted)";
const KEY = "var(--w-code-key)";
const STR = "var(--w-code-str)";
const NUM = "var(--w-code-num)";

const RAW = `{"order":"A-4417","customer":{"id":42,"name":"Tristan","email":"t@example.com","verified":true},"items":[{"sku":"KB-01","qty":2,"price":89.5},{"sku":"MS-07","qty":1,"price":42}],"total":221,"currency":"GBP","note":null,"placed":"2026-09-18T09:14:00Z"}`;

/** [indent, key, value, valueKind] — kept as data so the two panes stay in step. */
const PRETTY: Array<[number, string | null, string, "punct" | "str" | "num"]> = [
  [0, null, "{", "punct"],
  [1, "order", `"A-4417"`, "str"],
  [1, "customer", "{", "punct"],
  [2, "id", "42", "num"],
  [2, "name", `"Tristan"`, "str"],
  [2, "email", `"t@example.com"`, "str"],
  [2, "verified", "true", "num"],
  [1, null, "},", "punct"],
  [1, "items", "[", "punct"],
  [2, null, "{", "punct"],
  [3, "sku", `"KB-01"`, "str"],
  [3, "qty", "2", "num"],
  [3, "price", "89.5", "num"],
  [2, null, "},", "punct"],
  [2, null, "{", "punct"],
  [3, "sku", `"MS-07"`, "str"],
  [3, "qty", "1", "num"],
  [3, "price", "42", "num"],
  [2, null, "}", "punct"],
  [1, null, "],", "punct"],
  [1, "total", "221", "num"],
  [1, "currency", `"GBP"`, "str"],
  [1, "note", "null", "punct"],
  [1, "placed", `"2026-09-18T09:14:00Z"`, "str"],
  [0, null, "}", "punct"],
];

const VALUE_COLOR = { punct: PUNCT, str: STR, num: NUM } as const;

/** The three tinted primaries from `action-bar.tsx`. */
const PRIMARY = ["Format", "Minify", "Validate"];
/** The quieter actions that sit beside them. */
const SECONDARY = ["Sample", "Copy", "Share"];
/** `output-panel.tsx` TABS, in its order. */
const TABS = ["Formatted", "Minified", "XML", "CSV", "YAML", "Problems"];

export function EditorMock() {
  return (
    <div className="flex h-full w-full min-w-0 flex-col overflow-hidden text-left">
      {/* action bar */}
      <div
        className="flex shrink-0 flex-wrap items-center gap-1.5 px-4 py-2"
        style={{ borderBottom: `1px solid ${HAIRLINE}` }}
      >
        {PRIMARY.map((label) => (
          <span
            key={label}
            className="rounded-md px-2.5 py-1 text-[11px] font-medium text-white"
            style={{ backgroundColor: "var(--tint-from)" }}
          >
            {label}
          </span>
        ))}
        <span className="mx-1 h-4 w-px" style={{ backgroundColor: HAIRLINE }} />
        {SECONDARY.map((label) => (
          <span
            key={label}
            className="rounded-md px-2.5 py-1 text-[11px] font-medium"
            style={{ backgroundColor: "var(--w-sunken)", color: PUNCT }}
          >
            {label}
          </span>
        ))}
        <span className="ml-auto text-[11px]" style={{ color: PUNCT }}>
          Indent: 2
        </span>
      </div>

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-2">
        {/* input pane — one long line, the way a pasted payload arrives, with
            the Ln/Col footer the real pane carries */}
        <div
          className="flex min-w-0 flex-col overflow-hidden"
          style={{ borderRight: `1px solid ${HAIRLINE}` }}
        >
          <div
            className="min-h-0 flex-1 overflow-hidden p-3 text-[12px] leading-[19px]"
            style={{ fontFamily: MONO, color: PUNCT }}
          >
            <div className="flex gap-3">
              <span className="w-4 shrink-0 text-right" style={{ color: GUTTER }}>
                1
              </span>
              <span className="break-all">{RAW}</span>
            </div>
          </div>
          <div
            className="shrink-0 px-3 py-1.5 text-[10px]"
            style={{ borderTop: `1px solid ${HAIRLINE}`, color: GUTTER, fontFamily: MONO }}
          >
            Ln 1, Col 1
          </div>
        </div>

        {/* output pane — the real tab row, then the formatted document */}
        <div className="flex min-w-0 flex-col overflow-hidden">
          <div
            className="flex min-w-0 shrink-0 flex-wrap items-center gap-1 overflow-hidden px-3 py-1.5"
            style={{ borderBottom: `1px solid ${HAIRLINE}` }}
          >
            {TABS.map((tab, i) => (
              <span
                key={tab}
                className="rounded px-2 py-0.5 text-[11px] font-medium"
                style={
                  i === 0
                    ? { backgroundColor: "var(--w-sunken)", color: "var(--w-label)" }
                    : { color: PUNCT }
                }
              >
                {tab}
              </span>
            ))}
            {/* byte-badge.tsx prints exactly this, and only this */}
            <span
              className="ml-auto rounded-full px-2 py-0.5 text-[10px] tabular-nums"
              style={{ backgroundColor: "var(--w-sunken)", color: PUNCT, fontFamily: MONO }}
            >
              262 B
            </span>
          </div>

          <div
            className="min-h-0 flex-1 overflow-hidden p-3 text-[12px] leading-[19px]"
            style={{ fontFamily: MONO }}
          >
            {PRETTY.map(([depth, key, value, kind], i) => (
              <div key={`${i}-${key ?? value}`} className="flex gap-3 whitespace-pre">
                <span className="w-4 shrink-0 text-right" style={{ color: GUTTER }}>
                  {i + 1}
                </span>
                <span>
                  {"  ".repeat(depth)}
                  {key ? (
                    <>
                      <span style={{ color: KEY }}>{`"${key}"`}</span>
                      <span style={{ color: PUNCT }}>: </span>
                    </>
                  ) : null}
                  <span style={{ color: VALUE_COLOR[kind] }}>{value}</span>
                  {key && !value.endsWith("{") && !value.endsWith("[") ? (
                    <span style={{ color: PUNCT }}>,</span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
