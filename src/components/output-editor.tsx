/**
 * The read-only output editor — CodeMirror 6 rendering the active tab's derived
 * content with a language pack that matches the tab (JSON, XML, YAML, or plain
 * text for CSV / Problems). No editing, no autosave — pure presentation.
 */
import { useEffect, useRef } from "react";
import { basicSetup } from "codemirror";
import { EditorView } from "@codemirror/view";
import { Compartment, EditorState } from "@codemirror/state";
import { languageExtension, type EditorLanguage } from "@/lib/editor-setup";
import type { EditorTheme } from "@/lib/editor-themes";

interface OutputEditorProps {
  content: string;
  language: EditorLanguage;
  /** Active syntax theme; swapped live via a Compartment. */
  theme: EditorTheme;
}

/** Name the read-only output region for screen readers, per active language. */
function contentA11y(language: EditorLanguage) {
  return EditorView.contentAttributes.of({
    "aria-label": `${language.toUpperCase()} — результат, только чтение`,
    "aria-readonly": "true",
  });
}

export function OutputEditor({ content, language, theme }: OutputEditorProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const languageComp = useRef(new Compartment());
  const a11yComp = useRef(new Compartment());
  const themeComp = useRef(new Compartment());
  const themeRef = useRef(theme);
  themeRef.current = theme;

  useEffect(() => {
    if (!hostRef.current) return;
    const view = new EditorView({
      parent: hostRef.current,
      state: EditorState.create({
        doc: content,
        extensions: [
          basicSetup,
          languageComp.current.of(languageExtension(language)),
          themeComp.current.of(themeRef.current.extension),
          EditorView.lineWrapping,
          a11yComp.current.of(contentA11y(language)),
          EditorView.editable.of(false),
          EditorState.readOnly.of(true),
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

  // Update content when the derived output changes.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== content) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: content } });
    }
  }, [content]);

  // Swap the syntax theme live.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({ effects: themeComp.current.reconfigure(theme.extension) });
  }, [theme]);

  // Swap the language pack when the active tab changes.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: [
        languageComp.current.reconfigure(languageExtension(language)),
        a11yComp.current.reconfigure(contentA11y(language)),
      ],
    });
  }, [language]);

  return <div ref={hostRef} className="h-full min-h-0 overflow-auto text-sm" />;
}
