'use client';

import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

// Minimal WYSIWYG for circular summaries: bold, italic, links, bullet lists.
// Everything else StarterKit offers is switched off so the editor can only
// produce markup that lib/sanitize.ts keeps on the public site.
//
// Uncontrolled: `initialHtml` is read once on mount. Give the component a
// new `key` to load different content (e.g. when editing another circular).
export default function RichTextEditor({
  initialHtml,
  onChange,
}: {
  initialHtml: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: {
          openOnClick: false,
          // With autolink on, TipTap makes links "inclusive", so text typed
          // right after a link keeps extending it. Links come from the
          // toolbar button (or pasting a URL over selected text) instead.
          autolink: false,
          defaultProtocol: 'https',
          protocols: ['http', 'https', 'mailto'],
        },
      }),
    ],
    content: initialHtml,
    immediatelyRender: false, // avoid SSR hydration mismatch
    editorProps: {
      attributes: {
        class: 'rich-text min-h-[140px] px-3 py-2 text-sm focus:outline-none',
        'aria-label': 'Summary',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? '' : editor.getHTML()),
  });

  const active = useEditorState({
    editor,
    selector: ({ editor }) =>
      editor
        ? {
            bold: editor.isActive('bold'),
            italic: editor.isActive('italic'),
            link: editor.isActive('link'),
            bulletList: editor.isActive('bulletList'),
          }
        : null,
  });

  function toggleLink() {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    const url = window.prompt('Link URL (https://…)')?.trim();
    if (!url) return;
    if (!/^(https?:\/\/|mailto:)/i.test(url)) {
      window.alert('Links must start with https://, http:// or mailto:');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  const buttons: { label: string; title: string; isActive?: boolean; onClick: () => void; className?: string }[] =
    editor
      ? [
          { label: 'B', title: 'Bold', className: 'font-bold', isActive: active?.bold, onClick: () => editor.chain().focus().toggleBold().run() },
          { label: 'I', title: 'Italic', className: 'italic', isActive: active?.italic, onClick: () => editor.chain().focus().toggleItalic().run() },
          { label: active?.link ? 'Unlink' : 'Link', title: active?.link ? 'Remove link' : 'Add link', isActive: active?.link, onClick: toggleLink },
          { label: '• List', title: 'Bullet list', isActive: active?.bulletList, onClick: () => editor.chain().focus().toggleBulletList().run() },
        ]
      : [];

  return (
    <div className="border border-rule focus-within:border-maroon bg-white/40">
      <div className="flex gap-1 border-b border-rule px-1.5 py-1" role="toolbar" aria-label="Formatting">
        {buttons.map((b) => (
          <button
            key={b.title}
            type="button"
            title={b.title}
            aria-pressed={b.isActive}
            onMouseDown={(e) => e.preventDefault()} // keep the editor's selection
            onClick={b.onClick}
            className={`min-w-8 px-2 py-1 text-xs ${b.className ?? ''} ${
              b.isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-rule/40'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
