import { Node, mergeAttributes } from '@tiptap/react';

// A minimal inline image node for the summary editor: just `src` and `alt`.
// Written here (rather than adding @tiptap/extension-image) so the project
// needs no extra dependency on the server. Only approved image URLs survive
// saving — see lib/sanitize.ts.
export const InlineImage = Node.create({
  name: 'image',
  group: 'inline',
  inline: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'img[src]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes)];
  },
});
