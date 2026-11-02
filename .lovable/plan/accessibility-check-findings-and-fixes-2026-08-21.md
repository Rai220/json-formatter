# Accessibility check — findings and fixes

Read-only audit of the JSON Formatter route (`/`), its editors, tabbed output, toolbar, and page chrome. The app is in decent shape: `lang="en"` is set, there is exactly one `<main>` and one `<h1>`, both CodeMirror editors carry accessible names, icon-only buttons have `aria-label`, tabs and selects use Radix primitives, and tap targets are 44px below `lg`.

No critical blockers found. The gaps below are all Warning/Info level.

## Findings

### Warning
1. **Unlabeled regions.** The input pane and output pane in `src/pages/landing/index.tsx` are `<section>` elements with no accessible name, so screen-reader landmark navigation lists two unnamed regions.
2. **No skip link.** With a sticky header and a full-screen editor, keyboard users have no way to jump past the chrome to the editor.
3. **Validation state is not announced.** When the document becomes invalid, only the red line decoration in the editor and the Problems badge change. Nothing announces "1 problem" / "Valid JSON" to a screen reader; the error underline is color-only.
4. **Byte size and cursor position change silently.** `ByteBadge` and the `Ln x, Col y` footer update on every edit with no live-region policy — either announce or explicitly mark them as non-live.

### Info
5. **Tab list has no group name.** The `TabsList` in `src/components/output-panel.tsx` is unnamed; "Output formats" would orient users.
6. **Toolbar semantics.** The Format/Minify/Validate cluster in `src/components/action-bar.tsx` is a plain `div`; a `role="toolbar"` with a label groups it correctly.

## Proposed fixes

- `src/pages/landing/index.tsx`: add `aria-label="JSON input"` and `aria-label="Output"` to the two `<section>` panes; add a visually-hidden, focus-visible "Skip to editor" link at the top that targets the input pane; mark the `Ln/Col` footer `aria-hidden` (the editor itself announces position) — or keep it visible-only.
- `src/components/output-panel.tsx`: add `aria-label="Output formats"` to `TabsList`; wrap the byte/verdict slot in a `aria-live="polite"` region so the size and validity verdict are announced after edits settle.
- `src/components/problems-panel.tsx`: give the verdict badge a text-equivalent (`role="status"`) so validity is not conveyed by color alone.
- `src/components/action-bar.tsx`: wrap the three verb buttons in `role="toolbar"` with `aria-label="JSON actions"`.

No visual changes, no logic changes. After the edits, run the build and re-verify with a keyboard pass (Tab order: skip link → header actions → toolbar → editor → tabs → export buttons).
