import { useMemo } from 'react';
import CodeMirror, { BasicSetupOptions } from '@uiw/react-codemirror';
import { githubLightInit, githubDarkInit } from '@uiw/codemirror-theme-github';
import { langs } from '@uiw/codemirror-extensions-langs';

export type EditorLang = 'html' | 'md' | 'js' | 'python' | 'php' | 'ts';

const defaultOptions: BasicSetupOptions = {
  lineNumbers: false,
  foldGutter: false,
  highlightActiveLineGutter: false,
  highlightSpecialChars: true,
  history: true,
  drawSelection: true,
  dropCursor: true,
  allowMultipleSelections: true,
  indentOnInput: true,
  syntaxHighlighting: true,
  bracketMatching: false,
  closeBrackets: true,
  autocompletion: true,
  rectangularSelection: true,
  highlightActiveLine: false,
  highlightSelectionMatches: true,
  closeBracketsKeymap: true,
  defaultKeymap: true,
  searchKeymap: true,
  historyKeymap: true,
  foldKeymap: true,
  completionKeymap: true,
  lintKeymap: true,
};

const theme = {
  light: githubLightInit({
    settings: {
      fontFamily: '"Monaspace Neon", monospace',
    },
  }),
  dark: githubDarkInit({
    settings: {
      fontFamily: '"Monaspace Neon", monospace',
    },
  }),
};

export default function Editor({
  dark,
  lang,
  options,
  placeholder,
  value,
}: {
  dark?: boolean;
  lang: EditorLang;
  options?: Partial<BasicSetupOptions>;
  placeholder?: string;
  value?: string;
}) {
  const highlight = useMemo(() => {
    switch (lang) {
      case 'html':
        return langs.html();
      case 'md':
        return langs.markdown();
      case 'js':
        return langs.javascript();
      case 'php':
        return langs.php();
      case 'python':
        return langs.python();
      case 'ts':
        return langs.javascript();
      default:
        return undefined;
    }
  }, [lang]);

  return (
    <CodeMirror
      className="thatblog-code-editor"
      value={value}
      theme={dark === true ? theme.dark : theme.light}
      // onChange={(value) => props.onValueUpdated(value)}
      autoFocus={false}
      extensions={highlight ? [highlight] : []}
      placeholder={placeholder}
      basicSetup={{ ...defaultOptions, ...options }}
      lang={lang}
    />
  );
}
