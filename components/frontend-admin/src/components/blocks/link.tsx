import { Ellipsis } from 'lucide-react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export function LinkBlock() {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full rounded-md text-sm text-gray-900 gap-4 p-3 border border-input focus:border-indigo-600">
        <Label htmlFor="url">Enter URL</Label>
        <div className="flex flex-row space-x-2">
          <Input id="url" type="url" placeholder="http:// -or- https://" required />
          <button
            type="button"
            className="rounded-md bg-white cursor-pointer px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Fetch
          </button>
        </div>
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
