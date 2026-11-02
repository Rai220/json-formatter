/**
 * The two pictures that sit inside the big tiles.
 *
 * Both are drawn in the DOM rather than exported as images, so they stay sharp
 * at any size, follow the app's tint, and never fall out of date with the
 * product the way a screenshot does.
 */

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const SURFACE = "var(--w-sunken)";
const HAIRLINE = "var(--w-hairline)";
const MUTED = "var(--w-muted)";

/** Messy one-liner above, formatted below — the whole product in one picture. */
export function FormatVisual() {
  return (
    <div
      className="h-full w-full overflow-hidden p-4 text-[13px] leading-[20px]"
      style={{ backgroundColor: SURFACE, borderRadius: 8, fontFamily: MONO }}
    >
      <div className="truncate" style={{ color: MUTED }}>
        {`{"user":{"id":42,"tags":["a","b"],"ok":true}}`}
      </div>

      <div className="my-3" style={{ borderTop: `1px solid ${HAIRLINE}` }} />

      <pre className="whitespace-pre" style={{ color: "var(--w-label)" }}>
{`{
  "user": {
    "id": 42,
    "tags": ["a", "b"],
    "ok": true
  }
}`}
      </pre>
    </div>
  );
}

/** Three share links, the middle one lit — the document rides inside the URL. */
export function LinkVisual() {
  // Five, not three: the tile beside this one is filled to the bottom by its
  // code block, and a short column here leaves a hole in the pair.
  const links = [
    "#N4IgdghgNgpiBcIAuBnA9gOwAQFsCuATgJYAmA",
    "#JYWwDg9gTgLgBAWQIYwBYBsYHMA0cDeAUHHAJ4",
    "#BQhgTghsBcYHsCmB3AFgQXWA7AzgFwBMYAjAKw",
    "#KYOwrgtgBAsghgcwK5QDYEsoF4oG8BQUR0AzlA",
    "#DwEwlgbgBAxgNgQwM5ILwCIAWBTANJgJ4DcAUA",
  ];
  return (
    // Top-aligned, not centred: the tile beside this one starts its picture
    // right under the text, and a centred one floats out of step with it.
    <div className="flex h-full w-full flex-col gap-2">
      {links.map((l, i) => (
        <div
          key={l}
          className="truncate px-4 py-3 text-[13px]"
          style={{
            fontFamily: MONO,
            borderRadius: 999,
            // The middle one is the live one; the others sit back so the row
            // reads as "many links" without three things shouting at once.
            backgroundImage: i === 1 ? "var(--tint-gradient)" : undefined,
            backgroundColor: i === 1 ? undefined : SURFACE,
            color: i === 1 ? "#ffffff" : MUTED,
          }}
        >
          json-formatter.app/{l}
        </div>
      ))}
    </div>
  );
}
