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
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'airfindia.org',
      },
      {
        protocol: 'https',
        hostname: 'www.airfindia.org',
      },
    ],
  },
};

module.exports = nextConfig;
