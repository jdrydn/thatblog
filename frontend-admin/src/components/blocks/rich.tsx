'use client';

import { useState } from 'react';
import { useEditor, EditorContent /* BubbleMenu */ } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { Bold, Italic, UnderlineIcon, List, ListOrdered, Heading2, Heading3, Quote, LinkIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function RichTextBlock({
  className,
  onChange,
  disabled,
  value,
}: {
  value?: string | undefined;
  onChange?: (html: string) => void;
  placeholder?: string;
  disabled?: boolean | undefined;
  className?: string;
}) {
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value ?? '',
    editable: disabled !== true,
    editorProps: {
      attributes: {
        class: cn(
          'flex flex-col space-y-3',
          'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-full',
          'min-h-[50px] p-3 rounded-md border border-input bg-background',
          disabled !== true && 'cursor-default',
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  const addLink = () => {
    if (!linkUrl) return;

    editor?.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
    setLinkUrl('');
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn('thatblog-rich-editor flex flex-col space-y-2', className)}>
      {disabled !== true && (
        <div className="flex flex-wrap items-center gap-1 rounded-md border border-input bg-background p-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(['cursor-pointer', editor.isActive('bold') ? 'bg-muted' : ''])}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(['cursor-pointer', editor.isActive('italic') ? 'bg-muted' : ''])}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(['cursor-pointer', editor.isActive('underline') ? 'bg-muted' : ''])}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={cn(['cursor-pointer', editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''])}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={cn(['cursor-pointer', editor.isActive('heading', { level: 3 }) ? 'bg-muted' : ''])}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={cn(['cursor-pointer', editor.isActive('bulletList') ? 'bg-muted' : ''])}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={cn(['cursor-pointer', editor.isActive('orderedList') ? 'bg-muted' : ''])}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={cn(['cursor-pointer', editor.isActive('blockquote') ? 'bg-muted' : ''])}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>

          <Separator orientation="vertical" className="mx-1 h-6" />

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(['cursor-pointer', editor.isActive('link') ? 'bg-muted' : ''])}
                title="Link"
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Insert Link</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addLink} size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex rounded-md border border-input bg-background shadow-md"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(['cursor-pointer', editor.isActive('bold') ? 'bg-muted' : ''])}
          >
            <Bold className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(['cursor-pointer', editor.isActive('italic') ? 'bg-muted' : ''])}
          >
            <Italic className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={cn(['cursor-pointer', editor.isActive('underline') ? 'bg-muted' : ''])}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(['cursor-pointer', editor.isActive('link') ? 'bg-muted' : ''])}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Insert Link</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://example.com"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addLink} size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </BubbleMenu>
      )} */}

      <EditorContent className="rich-content" editor={editor} />
    </div>
  );
}
