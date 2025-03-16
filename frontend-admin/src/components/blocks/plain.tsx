import { useState } from 'react';
import { Ellipsis } from 'lucide-react';

import AutoResizeTextarea from '../inputs/textarea';

export function PlainTextBlock() {
  const [value, setValue] = useState('Hello, world!');

  return (
    <div className="flex flex-col w-full">
      <AutoResizeTextarea
        className="block w-full rounded-md bg-white p-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-input placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 resize-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex flex-row justify-end items-center w-full text-sm text-gray-900 space-x-2">
        <span>10%</span>
        <button type="button" className="cursor-pointer px-1">
          <Ellipsis />
        </button>
      </div>
    </div>
  );
}
