'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { X, Upload, ImageIcon, Film, Ellipsis } from 'lucide-react';

type MediaItem = {
  id: string;
  type: 'image' | 'video';
  url: string;
  file: File;
};

type GridLayout = '2x2' | '3x3';

export function MediaBlock() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [layout, setLayout] = useState<GridLayout>('2x2');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newMediaItems: MediaItem[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('image/') ? 'image' : 'video';

        newMediaItems.push({
          id: `${file.name}-${Date.now()}`,
          type,
          url,
          file,
        });
      }
    });

    setMediaItems([...mediaItems, ...newMediaItems]);

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems(mediaItems.filter((item) => item.id !== id));
  };

  const handleLayoutChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLayout(e.target.value as GridLayout);
  };

  const gridClass = layout === '2x2' ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="flex flex-col w-full">
      <div className="w-full p-3 border border-input rounded-md text-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label htmlFor="layout-select" className="block text-sm font-medium text-gray-700 mb-1">
              Layout
            </label>
            <select
              id="layout-select"
              value={layout}
              onChange={handleLayoutChange}
              className="block w-32 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="2x2">2×2 Grid</option>
              <option value="3x3">3×3 Grid</option>
            </select>
          </div>
        </div>

        {mediaItems.length > 0 ? (
          <div className={`grid ${gridClass} gap-4`}>
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="relative group aspect-square border border-gray-200 rounded-md overflow-hidden bg-gray-50"
              >
                {item.type === 'image' ? (
                  <img
                    src={item.url || '/placeholder.svg'}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" controls />
                )}

                <button
                  onClick={() => handleRemoveMedia(item.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove media"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center">
                    {item.type === 'image' ? <ImageIcon className="w-3 h-3 mr-1" /> : <Film className="w-3 h-3 mr-1" />}
                    <span className="truncate">{item.file.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500 mb-2">No media uploaded yet</p>
              <p className="text-gray-400 text-sm mb-4">Upload images or videos to display here</p>
              <label
                htmlFor="media-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Upload Media
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                multiple
                className="hidden"
                id="media-upload"
              />
            </div>
          </div>
        )}
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
