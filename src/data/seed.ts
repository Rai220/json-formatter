/**
 * Seed data — JSON Formatter (client-only tool).
 *
 * This template has no backend, no auth, no dual-mode data provider, and no
 * filterable collections. The single "read" is the document restore on page
 * load, which always returns the full document — never a filtered subset.
 *
 * The seed is used directly on `/` as the first-visit document. The filled
 * editor IS the onboarding.
 */

/** The three indent widths offered by the tab-width selector. */
export type TabWidth = 2 | 3 | 4;

/** One option in the tab-width `Select` — value + human label. */
export interface TabWidthOption {
  value: TabWidth;
  label: string;
}

/**
 * The document pre-loaded on first visit (no localStorage key, no URL hash).
 * Chosen to exercise every output tab:
 *   - Formatted tab: pretty-prints across 23 lines at 2-space indent
 *   - Minified tab: 343 B → 272 B (21% smaller)
 *   - XML tab: nested object + array of objects → valid XML
 *   - YAML tab: nested object → valid YAML
 *   - CSV tab: root is an object (not an array) → shows the non-tabular message intentionally
 *   - Problems tab (valid): 13 keys, max depth 3, type object
 *   - Problems tab (invalid): edit any value and break the syntax to see the caret report
 *
 * Raw size: 343 B   Formatted (2-space): 391 B / 23 lines   Minified: 272 B
 * Keys: 13   Max depth: 3   Root type: object
 */
export const sampleJson = `{
  "name": "International Space Station",
  "altitude_km": 408,
  "crew": [
    { "name": "Jasmine Bell", "role": "Commander" },
    { "name": "Tariq Hassan", "role": "Flight Engineer" },
    { "name": "Yuki Tanaka", "role": "Mission Specialist" }
  ],
  "systems": {
    "power": "solar",
    "comms": "Ku-band",
    "docking_ports": 2
  }
}`;

/**
 * The three tab-width options for the Indent selector.
 * Taken verbatim from jsonformatter.org's select (relabelled from "2 Tab Space" to "2 пробела").
 */
export const tabWidthOptions: TabWidthOption[] = [
  { value: 2, label: "2 пробела" },
  { value: 3, label: "3 пробела" },
  { value: 4, label: "4 пробела" },
];

/**
 * Default tab width. Matches jsonformatter.org's default selection.
 */
export const defaultTabWidth: TabWidth = 2;

/**
 * localStorage key for the autosaved document.
 */
export const LS_KEY = "jf_document";

/**
 * The hash size cap (bytes on the encoded string) above which Share falls back
 * to a toast ("Document too large to share via URL — copy or download it instead.").
 */
export const HASH_CAP_BYTES = 50_000;
