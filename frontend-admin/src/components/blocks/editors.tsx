import { useState } from 'react';
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

const langs = new Map<EditorLang, string>([
  ['html', 'HTML'],
  ['js', 'Javascript'],
  ['md', 'Markdown'],
  ['php', 'PHP'],
  ['python', 'Python'],
  ['ts', 'Typescript'],
]);

export function CodeBlock({ lang }: { lang: EditorLang }) {
  const [currentLang, setLang] = useState(lang);

  return (
    <div className="flex flex-col w-full">
      <div className="block w-full rounded-md text-sm text-gray-900 p-3 border border-input focus:border-indigo-600">
        <Editor lang={currentLang} value="const foo = 'bar';" />
      </div>
      <div className="flex flex-row justify-end items-center w-full text-sm text-gray-900 space-x-2">
        <div className="flex flex-col grow">
          <div className="flex flex-row">
            <select
              id="location"
              name="location"
              defaultValue={currentLang}
              className="rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 focus:outline-none text-xs"
              onChange={(e) => setLang(e.target.value as EditorLang)}
            >
              {Array.from(langs.entries()).map(([lang, label]) => (
                <option value={lang}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <span>10%</span>
        <button type="button" className="cursor-pointer px-1">
          <Ellipsis />
        </button>
      </div>
    </div>
  );
}
