// Server-only HTML sanitising for circular summaries. Summaries can come from
// AIRF imports as well as the admin editor, so nothing is rendered without
// passing through here first. Only the markup the editor itself produces
// (paragraphs, bold, italic, links, bullet lists) survives.

import sanitizeHtml from 'sanitize-html';
import { looksLikeHtml, textToHtml } from './summary';

// Editors leave empty paragraphs behind (e.g. a trailing "<p></p>").
const dropEmptyParagraphs = (frame: sanitizeHtml.IFrame) => frame.tag === 'p' && !frame.text.trim();

const FULL: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'a', 'ul', 'ol', 'li'],
  exclusiveFilter: dropEmptyParagraphs,
  // target/rel are listed so the values forced below survive; any
  // incoming target/rel is overwritten by the transform.
  allowedAttributes: { a: ['href', 'target', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  transformTags: {
    // Every link opens in a new tab and can't reach back into this window.
    a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer nofollow' }),
  },
};

// For previews inside a card that is itself one big link: no nested <a>,
// no block elements (they'd break line-clamp), just inline emphasis.
const PREVIEW: sanitizeHtml.IOptions = {
  allowedTags: ['strong', 'b', 'em', 'i'],
  allowedAttributes: {},
};

function toHtml(summary: string): string {
  return looksLikeHtml(summary) ? summary : textToHtml(summary);
}

// Full summary: detail page and CircularCard lists.
export function summaryHtml(summary: string): string {
  return sanitizeHtml(toHtml(summary ?? ''), FULL);
}

// One-line-ish preview: block boundaries become spaces so words don't merge.
export function summaryPreviewHtml(summary: string): string {
  const spaced = toHtml(summary ?? '').replace(/<\/(p|li|ul|ol)>|<br\s*\/?>/gi, ' ');
  return sanitizeHtml(spaced, PREVIEW).replace(/\s+/g, ' ').trim();
}

// Used when saving: store only markup we'd render anyway.
export function sanitizeSummaryForStorage(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: FULL.allowedTags,
    allowedAttributes: { a: ['href'] },
    allowedSchemes: FULL.allowedSchemes,
    allowProtocolRelative: false,
    exclusiveFilter: dropEmptyParagraphs,
  });
}

// Visible text of a summary, for "is it empty?" checks.
export function summaryText(html: string): string {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).replace(/&nbsp;/g, ' ').trim();
}
