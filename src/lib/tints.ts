/**
 * App tints — the identity-color options the model picks ONE from per template
 * app (one identity tint per app).
 *
 * This is the typed contract (names + labels + a preview swatch for pickers).
 * The runtime values live in `tints.css` as `[data-tint="<name>"]` CSS custom
 * properties; set `data-tint` on the landing/app root to apply one.
 */
export const tints = {
  green: { label: "Green", preview: "#5c8a1e" },
  crimson: { label: "Crimson", preview: "#e5254e" },
  plum: { label: "Plum", preview: "#822045" },
  indigo: { label: "Indigo", preview: "#443ca6" },
  azure: { label: "Azure", preview: "#0068c4" },
  teal: { label: "Teal", preview: "#0b7e78" },
} as const;

export type TintName = keyof typeof tints;

/**
 * This app's identity tint, in ONE place.
 *
 * `data-tint` is set on a page root, and CSS custom properties only reach what
 * sits inside that element. Anything rendered through a PORTAL — a dialog, a
 * popover — lands on `<body>`, outside it, and silently falls back to the
 * default. Those surfaces must carry `data-tint={APP_TINT}` themselves;
 * importing the name from here is what stops pages drifting apart.
 */
export const APP_TINT: TintName = "azure";
