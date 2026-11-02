/**
 * Design-system color tokens — the source of truth for interactive-card colors.
 *
 * 8 hues x 5 shades (darker, dark, bright, light, pastel), plus a grey scale and
 * primitives. Each hue's brand color sits at `bright`; the ramp is generated with
 * chroma.js in CIE LCH so `darker`/`dark` deepen it while staying saturated, `light`
 * is a saturated light tint (~95% HSL S), and `pastel` is a soft wash. Cards fill a
 * solid token; text pairs to white on dark, black on light.
 */

export const palette = {
  primitives: { black: "#000000", white: "#FFFFFF", transparent: "transparent" },
  grey: {
    95: "#121212", 90: "#1A1A1A", 85: "#262626", 80: "#333333", 75: "#404040",
    70: "#4D4D4D", 65: "#595959", 60: "#666666", 55: "#737373", 50: "#808080",
    45: "#8C8C8C", 40: "#999999", 35: "#A6A6A6", 30: "#B3B3B3", 25: "#BFBFBF",
    20: "#CCCCCC", 15: "#D9D9D9", 10: "#E6E6E6", 5: "#F2F2F2", 2: "#F8F8F8", 1: "#FCFCFC",
  },
  yellow: { darker: "#1D1200", dark: "#553F00", bright: "#FFCC00", light: "#FCE68D", pastel: "#F8E4BC" },
  orange: { darker: "#210F00", dark: "#6C3100", bright: "#FF8C29", light: "#FCC08D", pastel: "#FFDEC5" },
  green:  { darker: "#031703", dark: "#004E15", bright: "#3AC85C", light: "#8DFCA7", pastel: "#CFEED0" },
  cyan:   { darker: "#03151B", dark: "#004A61", bright: "#01C8F5", light: "#8DE8FC", pastel: "#CFEAF6" },
  blue:   { darker: "#0C1322", dark: "#004182", bright: "#0388FF", light: "#8DC7FC", pastel: "#DCE5FF" },
  purple: { darker: "#150F25", dark: "#3E348C", bright: "#6256F4", light: "#958DFC", pastel: "#ECDFFF" },
  pink:   { darker: "#1F0C20", dark: "#6D1B79", bright: "#CA31E0", light: "#EE8DFC", pastel: "#FFDAFF" },
  red:    { darker: "#250B09", dark: "#831228", bright: "#FF3157", light: "#FC8DA1", pastel: "#FFD8D7" },
} as const;

export type Hue = "yellow" | "orange" | "green" | "cyan" | "blue" | "purple" | "pink" | "red";
export type Shade = "darker" | "dark" | "bright" | "light" | "pastel";

/** Resolve a hue+shade to its hex, e.g. token("purple", "bright"). */
export function token( hue: Hue, shade: Shade ): string {
  return palette[hue][shade];
}

/** Brightness of a hex: mean of R/G/B normalized to 0..1 (`(r+g+b)/3/255`). */
export function brightness( hex: string ): number {
  const h = hex.replace( "#", "" );
  const r = parseInt( h.slice( 0, 2 ), 16 );
  const g = parseInt( h.slice( 2, 4 ), 16 );
  const b = parseInt( h.slice( 4, 6 ), 16 );
  return ( r + g + b ) / 3 / 255;
}

/** Text color paired to a background — white on dark fills, black on light ones (threshold 0.75). */
export function readableTextColor( bgHex: string ): string {
  return brightness( bgHex ) > 0.75 ? palette.primitives.black : palette.primitives.white;
}

/**
 * Inject every hue×shade as a CSS custom property (`--color-<hue>-<shade>`) on
 * `:root` so the Tailwind color utilities (`bg-blue-bright`, `text-red-dark`, …)
 * resolve to these values. `palette` stays the single source of truth — the vars
 * are derived from it, never duplicated. Call once at startup (see `main.tsx`).
 */
export function installPaletteVars(): void {
  const root = document.documentElement;
  for ( const [ hue, shades ] of Object.entries( palette ) ) {
    if ( hue === "primitives" || hue === "grey" ) continue;
    for ( const [ shade, hex ] of Object.entries( shades as Record<string, string> ) ) {
      root.style.setProperty( `--color-${hue}-${shade}`, hex );
    }
  }
}
