import Editor, { type EditorLang } from '@thatblog/code-editor';
import { Ellipsis } from 'lucide-react';

export function HtmlBlock() {
  return (
    <div className="flex flex-col w-full">
      <div className="block w-full rounded-md text-sm text-gray-900 p-3 border border-input focus:border-indigo-600">
        <Editor lang="html" placeholder="<!-- HTML here -->" value="<p>Hello, world!</p>" />
      </div>
      <div className="flex flex-row justify-end items-center w-full text-sm text-gray-900 space-x-2">
        <span>10%</span>
        <button type="button" className="cursor-pointer px-1">
          <Ellipsis />
        </button>
      </div>
    </div>
  );
}

export function MarkdownBlock() {
  return (
    <div className="flex flex-col w-full">
      <div className="block w-full rounded-md text-sm text-gray-900 p-3 border border-input focus:border-indigo-600">
        <Editor lang="md" placeholder="<!-- Markdown here -->" value="# Hello, world!" />
      </div>
      <div className="flex flex-row justify-end items-center w-full text-sm text-gray-900 space-x-2">
        <span>10%</span>
        <button type="button" className="cursor-pointer px-1">
          <Ellipsis />
        </button>
      </div>
    </div>
  );
}

export function CodeBlock({ lang }: { lang: EditorLang }) {
  return (
    <div className="flex flex-col w-full">
      <div className="block w-full rounded-md text-sm text-gray-900 p-3 border border-input focus:border-indigo-600">
        <Editor lang={lang} value="const foo = 'bar';" />
      </div>
      <div className="flex flex-row justify-end items-center w-full text-sm text-gray-900 space-x-2">
        <span>10%</span>
        <button type="button" className="cursor-pointer px-1">
          <Ellipsis />
        </button>
      </div>
    </div>
  );
}
