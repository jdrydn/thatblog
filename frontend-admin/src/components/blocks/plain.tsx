import { useState } from 'react';

import AutoResizeTextarea from '../inputs/textarea';

export function PlainTextBlock() {
  const [value, setValue] = useState('Hello, world!');

  return (
    <AutoResizeTextarea
      className="block w-full rounded-md bg-white p-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-input placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 resize-none"
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}
