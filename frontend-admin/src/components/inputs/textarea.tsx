'use client';
import { useEffect, useRef, type ChangeEvent, type TextareaHTMLAttributes } from 'react';

export default function AutoResizeTextarea(props?: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to match the content
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  useEffect(() => {
    // Adjust height on initial render
    adjustHeight();
    // Add resize event listener to handle window resizing
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, []);

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    props?.onChange?.(e);
  };

  return (
    <textarea
      rows={1}
      {...props}
      ref={textareaRef}
      onChange={handleInput}
      className={`textarea-autoresize ${props?.className ?? ''}`.trim()}
    />
  );
}
