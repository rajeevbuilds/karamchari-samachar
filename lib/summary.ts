// Circular summaries are stored as HTML written by the admin rich-text
// editor. Older rows (and AIRF imports) hold plain text, where blank lines
// separate paragraphs. These helpers carry no dependencies, so both the
// admin editor (client) and lib/sanitize.ts (server) can use them.

export function looksLikeHtml(s: string): boolean {
  return /<\/?[a-z][a-z0-9]*[\s>/]/i.test(s);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Plain text → paragraphs; single newlines become <br>.
export function textToHtml(text: string): string {
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para) => `<p>${escapeHtml(para.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// What the editor should load for a stored summary.
export function summaryToEditorHtml(summary: string): string {
  if (!summary) return '';
  return looksLikeHtml(summary) ? summary : textToHtml(summary);
}
