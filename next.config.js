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
