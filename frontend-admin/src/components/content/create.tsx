import { blockType } from '@/types';

export default function CreateContentMenu({ onClick }: { onClick?: (type: blockType) => void }) {
  return (
    <div className="flex flex-row justify-start gap-x-4">
      <button
        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:cursor-pointer"
        onClick={() => onClick?.('PLAIN_TEXT')}
        type="button"
      >
        + Plain Text
      </button>
      <button
        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:cursor-pointer"
        onClick={() => onClick?.('MARKDOWN')}
        type="button"
      >
        + Markdown
      </button>
      <button
        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:cursor-pointer"
        onClick={() => onClick?.('RICH_TEXT')}
        type="button"
      >
        + Rich Text
      </button>
      <button
        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:cursor-pointer"
        onClick={() => onClick?.('HTML')}
        type="button"
      >
        + HTML
      </button>
      <button
        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:cursor-pointer"
        onClick={() => onClick?.('CODE')}
        type="button"
      >
        + Code Block
      </button>
      <button
        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:cursor-pointer"
        onClick={() => onClick?.('LINK')}
        type="button"
      >
        + Link
      </button>
      <button
        className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:cursor-pointer"
        onClick={() => onClick?.('MEDIA')}
        type="button"
      >
        + Media
      </button>
    </div>
  );
}
