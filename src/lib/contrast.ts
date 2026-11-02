/**
 * WCAG contrast helpers for the editor chrome.
 *
 * Syntax themes come from many upstream palettes and some ship muted inks
 * that miss 4.5:1 on their own pane. `readableInk` keeps a theme's hue but
 * nudges it (dim alpha first, then toward black/white) until it clears AA.
 */
type RGB = [number, number, number];

function parse(color: string): { rgb: RGB; a: number } | null {
  const c = color.trim();
  const hex = c.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length <= 4) h = [...h].map((x) => x + x).join("");
    const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
    return { rgb: [n(0), n(2), n(4)], a: h.length === 8 ? n(6) / 255 : 1 };
  }
  const fn = c.match(/^rgba?\(([^)]+)\)$/i);
  if (fn) {
    const p = fn[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { rgb: [p[0], p[1], p[2]], a: p[3] ?? 1 };
  }
  return null;
}

const lum = ([r, g, b]: RGB) => {
  const f = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

export function contrast(a: RGB, b: RGB): number {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

const mix = (a: RGB, b: RGB, t: number): RGB => [0, 1, 2].map((i) => Math.round(a[i] * t + b[i] * (1 - t))) as RGB;
const css = ([r, g, b]: RGB) => `rgb(${r}, ${g}, ${b})`;

/**
 * An opaque ink readable on `background` at `min` contrast, as close to
 * `ink` (blended at `alpha`) as possible. Unparseable input is returned as-is.
 */
export function readableInk(ink: string, background: string, alpha = 1, min = 4.6): string {
  const fg = parse(ink);
  const bg = parse(background);
  if (!fg || !bg) return ink;
  const base = fg.rgb;
  for (let a = alpha; a <= 1.0001; a += 0.04) {
    const c = mix(base, bg.rgb, Math.min(a, 1));
    if (contrast(c, bg.rgb) >= min) return css(c);
  }
  const target: RGB = lum(bg.rgb) > 0.18 ? [0, 0, 0] : [255, 255, 255];
  for (let t = 0.05; t <= 1.0001; t += 0.05) {
    const c = mix(target, base, Math.min(t, 1));
    if (contrast(c, bg.rgb) >= min) return css(c);
  }
  return css(target);
}
