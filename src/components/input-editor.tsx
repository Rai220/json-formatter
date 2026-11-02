/**
 * The writable input editor — CodeMirror 6 with JSON syntax highlighting, line
 * numbers, bracket matching, undo/redo, an `Ln/Col` footer, and a red underline
 * decoration on the offending line when the document is invalid.
 *
 * Controlled: every keystroke fires `onChange` (the page autosaves + re-parses).
 * External updates (Sample, Clear, Upload, URL/localStorage restore) flow in via
 * the `value` prop and are reconciled without clobbering the cursor on no-op
 * echoes. `jumpToLine` (imperative handle) powers the Problems "Jump to line N".
 */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { Decoration, type DecorationSet } from "@codemirror/view";
import { Compartment, EditorState, StateEffect, StateField } from "@codemirror/state";
import { json } from "@codemirror/lang-json";
import { isolateHistory } from "@codemirror/commands";
import type { EditorTheme } from "@/lib/editor-themes";

export interface InputEditorHandle {
  /** Scroll to `line`, place the cursor there, and focus the editor. */
  jumpToLine: (line: number) => void;
}

interface InputEditorProps {
  value: string;
  onChange: (text: string) => void;
  onCursorChange: (position: { line: number; column: number }) => void;
  /** 1-based line to underline as the parse-error location, or `null`. */
  errorLine: number | null;
  /** Active syntax theme; swapped live via a Compartment (cursor/undo survive). */
  theme: EditorTheme;
}

const errorLineDecoration = Decoration.line({ class: "cm-error-line" });
const setErrorLineEffect = StateEffect.define<number | null>();

function buildErrorDeco(state: EditorState, line: number | null): DecorationSet {
  if (!line || line < 1 || line > state.doc.lines) return Decoration.none;
  const from = state.doc.line(line).from;
  return Decoration.set([errorLineDecoration.range(from)]);
}

const errorLineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(deco, tr) {
    let next = deco.map(tr.changes);
    for (const effect of tr.effects) {
      if (effect.is(setErrorLineEffect)) {
        next = buildErrorDeco(tr.state, effect.value);
      }
    }
    return next;
  },
  provide: (field) => EditorView.decorations.from(field),
});

export const InputEditor = forwardRef<InputEditorHandle, InputEditorProps>(function InputEditor(
  { value, onChange, onCursorChange, errorLine, theme },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeComp = useRef(new Compartment());
  const themeRef = useRef(theme);
  themeRef.current = theme;
  const onChangeRef = useRef(onChange);
  const onCursorRef = useRef(onCursorChange);
  onChangeRef.current = onChange;
  onCursorRef.current = onCursorChange;

  useImperativeHandle(ref, () => ({
    jumpToLine(line: number) {
      const view = viewRef.current;
      if (!view) return;
      const target = Math.min(Math.max(line, 1), view.state.doc.lines);
      const { from } = view.state.doc.line(target);
      view.dispatch({
        selection: { anchor: from },
        scrollIntoView: true,
      });
      view.focus();
    },
  }));

  // Create the editor once.
  useEffect(() => {
    if (!hostRef.current) return;
    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChangeRef.current(update.state.doc.toString());
      }
      if (update.docChanged || update.selectionSet) {
        const head = update.state.selection.main.head;
        const line = update.state.doc.lineAt(head);
        onCursorRef.current({ line: line.number, column: head - line.from + 1 });
      }
    });

    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          json(),
          errorLineField,
          themeComp.current.of(themeRef.current.extension),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            "aria-label": "Редактор JSON и JSONL",
            "aria-multiline": "true",
          }),
          updateListener,
        ],
      }),
    });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconcile external value changes (Sample / Clear / Upload / restore).
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
        // Its own undo step: Sample / Clear / Upload / shared-link loads are
        // always reversible with Cmd/Ctrl+Z, never merged into recent typing.
        annotations: isolateHistory.of("full"),
      });
    }
  }, [value]);

  // Swap the syntax theme live — document, cursor, and undo history survive.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: themeComp.current.reconfigure(theme.extension) });
  }, [theme]);

  // Reconcile the error-line decoration.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: setErrorLineEffect.of(errorLine) });
  }, [errorLine]);

  return <div ref={hostRef} className="h-full min-h-0 overflow-auto text-sm" />;
});
