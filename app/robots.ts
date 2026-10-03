import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// Public pages are open to crawlers; the admin panel and API are not.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
