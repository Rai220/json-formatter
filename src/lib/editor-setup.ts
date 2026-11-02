/**
 * Shared CodeMirror 6 configuration for the JSON Formatter's editors.
 *
 * A single dark, transparent theme + syntax palette so both the writable input
 * editor and the read-only output editor read cleanly against the frosted
 * `.card-tonal` panels on the azure gradient canvas.
 */
import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Prec, type Extension } from "@codemirror/state";
import { tags as t } from "@lezer/highlight";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";

export type EditorLanguage = "json" | "xml" | "yaml" | "plaintext";

/** Language extension for a given output tab. */
export function languageExtension(language: EditorLanguage): Extension {
  switch (language) {
    case "json":
      return json();
    case "xml":
      return xml();
    case "yaml":
      return yaml();
    case "plaintext":
      return [];
  }
}

/** Light theme for the full-bleed white workbench panes (dark ink text). */
export const toolEditorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "transparent",
      color: "#0b2545",
      fontSize: "13px",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      lineHeight: "1.5",
    },
    ".cm-content": { caretColor: "#0b2545" },
    "&.cm-focused": { outline: "none" },
    ".cm-gutters": {
      backgroundColor: "transparent",
      color: "rgba(11,37,69,0.62)",
      border: "none",
    },
    ".cm-activeLine": { backgroundColor: "rgba(0,56,120,0.05)" },
    ".cm-activeLineGutter": { backgroundColor: "rgba(0,56,120,0.08)" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: "#0b2545" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgba(0,110,220,0.18)",
    },
    ".cm-matchingBracket, .cm-focused .cm-matchingBracket": {
      backgroundColor: "rgba(0,110,220,0.12)",
      outline: "1px solid rgba(0,110,220,0.5)",
    },
    ".cm-error-line": {
      textDecoration: "underline wavy rgba(216,32,32,0.9)",
      textUnderlineOffset: "3px",
    },
    ".cm-placeholder": { color: "rgba(11,37,69,0.5)" },
  },
  { dark: false },
);

/** Dark-on-white syntax palette — every pair clears WCAG AA on white. */
export const toolHighlight: Extension = Prec.highest(
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: t.string, color: "#0a6e3d" },
      { tag: t.number, color: "#9a5800" },
      { tag: [t.bool, t.null, t.keyword], color: "#b3186d" },
      { tag: [t.propertyName, t.definition(t.propertyName)], color: "#003878", fontWeight: "600" },
      { tag: [t.brace, t.bracket, t.punctuation, t.separator], color: "rgba(11,37,69,0.65)" },
      { tag: [t.tagName, t.angleBracket], color: "#003878" },
      { tag: t.attributeName, color: "#9a5800" },
      { tag: t.attributeValue, color: "#0a6e3d" },
      { tag: [t.comment, t.meta], color: "rgba(11,37,69,0.6)" },
    ]),
  ),
);
