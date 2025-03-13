import Editor, { type EditorLang } from '@thatblog/code-editor';

export function HtmlBlock() {
  return (
    <div className="block w-full rounded-md text-sm text-gray-900 p-3 border border-input focus:border-indigo-600">
      <Editor lang="html" value="<p>Hello, world!</p>" />
    </div>
  );
}

export function MarkdownBlock() {
  return (
    <div className="block w-full rounded-md text-sm text-gray-900 p-3 border border-input focus:border-indigo-600">
      <Editor lang="md" value="# Hello, world!" />
    </div>
  );
}

export function CodeBlock({ lang }: { lang: EditorLang }) {
  return (
    <div className="block w-full rounded-md text-sm text-gray-900 p-3 border border-input focus:border-indigo-600">
      <Editor lang={lang} value="const foo = 'bar';" />
    </div>
  );
}
