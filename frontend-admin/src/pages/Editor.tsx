import { useState } from 'react';

import CreateContentMenu from '@/components/content/create';
import TitleInput from '@/components/inputs/textarea';
import {
  PlainTextBlock,
  MarkdownBlock,
  HtmlBlock,
  CodeBlock,
  RichTextBlock,
  LinkBlock,
  MediaBlock,
} from '@/components/blocks';

import type { blockType } from '@/types';

export default function Home() {
  const [blocks, setBlocks] = useState<blockType[]>([
    'PLAIN_TEXT',
    'MARKDOWN',
    'RICH_TEXT',
    'HTML',
    'CODE',
    'LINK',
    'MEDIA',
  ]);

  return (
    <div className="flex flex-col gap-2 px-3 md:px-10">
      <div className="flex flex-row py-4 px-1">
        <ul className="flex flex-row text-sm gap-2">
          <li>
            <a className="text-blue-700 hover:underline" href="/admin">
              &laquo; Back
            </a>
          </li>
        </ul>
      </div>
      <div className="flex flex-col gap-6 mb-10 px-1">
        <div className="flex flex-col mb-5 px-1">
          <TitleInput
            id="title"
            name="title"
            className="block w-full bg-white p-3 text-2xl text-gray-900 border-b border-input focus:outline-none focus:border-blue-500 placeholder:text-gray-400 resize-none"
            placeholder="Title"
            defaultValue={''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              if (e.clipboardData.getData('text').includes('\n')) {
                e.preventDefault();
              }
            }}
          />
        </div>
        {blocks.map((block, i) => (
          <div className="flex flex-col px-1" key={i}>
            {(() => {
              switch (block) {
                case 'PLAIN_TEXT': {
                  return <PlainTextBlock />;
                }
                case 'MARKDOWN': {
                  return <MarkdownBlock />;
                }
                case 'RICH_TEXT': {
                  return <RichTextBlock />;
                }
                case 'HTML': {
                  return <HtmlBlock />;
                }
                case 'CODE': {
                  return <CodeBlock lang="ts" />;
                }
                case 'LINK': {
                  return <LinkBlock />;
                }
                case 'MEDIA': {
                  return <MediaBlock />;
                }
              }
            })()}
          </div>
        ))}
        <div className="flex flex-col border-b border-gray-200 my-5 px-1 pb-4">
          <CreateContentMenu onClick={(type) => setBlocks(blocks.concat([type]))} />
        </div>
        <div className="flex flex-row gap-x-4 px-1">Date options etc</div>
      </div>
    </div>
  );
}
