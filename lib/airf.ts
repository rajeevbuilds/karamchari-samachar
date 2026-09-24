// Server-side client for the airfindia.org WordPress REST API, used by the
// admin "Import from AIRF" feature. Only called from admin API routes.
//
// Featured images come back inline via `_embed=wp:featuredmedia`
// (`_embedded['wp:featuredmedia'][0].source_url`), so there's no per-post
// /media/{id} round trip. If a post has a featured_media id but the embed
// is missing or errored (e.g. the attachment isn't publicly readable), we
// fall back to fetching /media/{id} for that post only.

const WP_API = 'https://airfindia.org/wp-json/wp/v2';

// Must match the next/image remotePatterns in next.config.js — public pages
// render image_url through next/image, which throws on any other host.
const ALLOWED_IMAGE_HOSTS = new Set(['airfindia.org', 'www.airfindia.org']);

export type AirfCategory = { id: number; name: string; count: number };

export type AirfPost = {
  wpId: number;
  title: string;
  date: string; // YYYY-MM-DD
  link: string;
  excerpt: string;
  imageUrl: string | null; // full-size featured image
  thumbUrl: string | null; // smaller rendition for the admin review list
};

type WpMedia = {
  source_url?: string;
  code?: string;
  media_details?: { sizes?: Record<string, { source_url: string }> };
};

type WpPost = {
  id: number;
  date: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  _embedded?: { 'wp:featuredmedia'?: WpMedia[] };
};

type WpCategory = { id: number; name: string; count: number; parent: number };

async function wpFetch<T>(path: string): Promise<{ data: T; totalPages: number }> {
  const res = await fetch(`${WP_API}${path}`, {
    cache: 'no-store',
    headers: { Accept: 'application/json', 'User-Agent': 'KaramchariSamachar-Import/1.0' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`airfindia.org API returned HTTP ${res.status} for ${path}`);
  }
  return {
    data: (await res.json()) as T,
    totalPages: Number(res.headers.get('x-wp-totalpages')) || 1,
  };
}

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  hellip: '…', ndash: '–', mdash: '—', lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
};

function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? match;
  });
}

// WordPress excerpts are HTML, usually ending in "[&hellip;]".
function htmlToText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s*\[…\]\s*$/, '…')
    .replace(/\s+/g, ' ')
    .trim();
}

// WordPress sometimes returns http:// media URLs; always store https so
// images never trigger mixed-content warnings on the https site.
function allowedImage(url: string | undefined | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) return null;
    parsed.protocol = 'https:';
    return parsed.toString();
  } catch {
    return null;
  }
}

async function resolveMedia(post: WpPost): Promise<WpMedia | null> {
  if (!post.featured_media) return null;
  const embedded = post._embedded?.['wp:featuredmedia']?.[0];
  if (embedded?.source_url) return embedded;
  try {
    const { data } = await wpFetch<WpMedia>(`/media/${post.featured_media}?_fields=source_url,media_details`);
    return data.source_url ? data : null;
  } catch {
    return null;
  }
}

async function toAirfPost(post: WpPost): Promise<AirfPost> {
  const media = await resolveMedia(post);
  const sizes = media?.media_details?.sizes;
  const imageUrl = allowedImage(media?.source_url);
  return {
    wpId: post.id,
    title: htmlToText(post.title.rendered),
    date: post.date.slice(0, 10),
    link: post.link,
    excerpt: htmlToText(post.excerpt.rendered),
    imageUrl,
    thumbUrl: imageUrl && (allowedImage(sizes?.medium?.source_url) ?? allowedImage(sizes?.thumbnail?.source_url) ?? imageUrl),
  };
}

const POST_QUERY =
  '_embed=wp:featuredmedia&_fields=id,date,link,title,excerpt,featured_media,_links,_embedded';

// Categories with at least one post, with parents shown as "Parent › Child".
export async function fetchAirfCategories(): Promise<AirfCategory[]> {
  const fields = '_fields=id,name,count,parent&per_page=100&hide_empty=true';
  const first = await wpFetch<WpCategory[]>(`/categories?${fields}&page=1`);
  const all = [...first.data];
  for (let page = 2; page <= first.totalPages; page++) {
    all.push(...(await wpFetch<WpCategory[]>(`/categories?${fields}&page=${page}`)).data);
  }

  const byId = new Map(all.map((c) => [c.id, c]));
  const label = (c: WpCategory): string => {
    const parent = c.parent ? byId.get(c.parent) : undefined;
    return decodeEntities(parent ? `${label(parent)} › ${c.name}` : c.name);
  };
  return all
    .map((c) => ({ id: c.id, name: label(c), count: c.count }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchAirfPosts(
  categoryId: number,
  page: number,
  perPage = 20
): Promise<{ posts: AirfPost[]; totalPages: number }> {
  const { data, totalPages } = await wpFetch<WpPost[]>(
    `/posts?categories=${categoryId}&page=${page}&per_page=${perPage}&orderby=date&order=desc&${POST_QUERY}`
  );
  return { posts: await Promise.all(data.map(toAirfPost)), totalPages };
}

export async function fetchAirfPostsByIds(ids: number[]): Promise<AirfPost[]> {
  if (ids.length === 0) return [];
  const { data } = await wpFetch<WpPost[]>(
    `/posts?include=${ids.join(',')}&per_page=${ids.length}&${POST_QUERY}`
  );
  return Promise.all(data.map(toAirfPost));
}
