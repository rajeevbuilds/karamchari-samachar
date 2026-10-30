const MERGED_FITMENT_POSTS = [
  '8th-pay-commission-fitment-factor-2-00-3-00',
  '8-18-000-minimum-pay-34-973-fitment-factor',
  '8th-cpc-1-94-fitment-factor-explained-how-18-000-basic-pay-could-become-34-973',
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Shared hosting (cPanel/CloudLinux) enforces a low per-account process
  // limit. Next's default build parallelism spawns one worker per CPU core,
  // which blows past that limit and crashes with
  // "pthread_create: Resource temporarily unavailable". Force a single
  // build worker to stay within the account's limits.
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  images: {
    // http is allowed too: WordPress (including AIRF imports) sometimes hands
    // out http:// media URLs, and next/image throws on any unlisted protocol.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'airfindia.org',
      },
      {
        protocol: 'http',
        hostname: 'airfindia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.airfindia.org',
      },
      {
        protocol: 'http',
        hostname: 'www.airfindia.org',
      },
    ],
  },
  // The site answers on both sarkarikaramchari.com and www.sarkarikaramchari.com,
  // so search engines saw every page twice. Send the www address to the main one
  // permanently (path and query string are kept). Only the exact www host matches,
  // so the main address, GoDaddy's preview address and local testing are untouched.
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.sarkarikaramchari.com' }],
        destination: 'https://sarkarikaramchari.com/:path*',
        permanent: true,
      },
      // Three older 8th CPC fitment-factor posts were merged into one fuller
      // post. Their addresses go to it permanently so old links, shares and
      // search results keep working.
      ...MERGED_FITMENT_POSTS.map((slug) => ({
        source: `/circulars/${slug}`,
        destination: '/circulars/8-fitment-factor-basic-pay',
        permanent: true,
      })),
    ];
  },
  async headers() {
    return [
      {
        // GoDaddy's hosting layer applies a blanket long-lived cache to
        // static-looking file extensions, which caught sw.js along with
        // regular content-hashed JS chunks. Unlike those, the service
        // worker script's own freshness is what lets browsers notice a
        // new deploy at all - an open tab can otherwise keep running
        // whatever JS it already loaded for as long as this cache holds,
        // even though the server has moved on. Force revalidation on
        // every request so a reload always picks up the latest version.
        source: '/sw.js',
        headers: [{ key: 'Cache-Control', value: 'no-cache' }],
      },
    ];
  },
};

module.exports = nextConfig;
