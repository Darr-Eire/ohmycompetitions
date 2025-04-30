// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  
    // If you ever want to opt out of the swcMinify warning,
    // you can remove this—but a fresh rebuild is forced by changing any config.
    swcMinify: false, // no-op, just to force cache invalidation
  
    webpack(config) {
      // Stub out Node.js core modules MongoDB driver depends on,
      // so Next.js’s client-side bundle build won’t error on import.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        'fs/promises': false,
        child_process: false,
        'timers/promises': false,
      };
      return config;
    },
  };
  
  module.exports = nextConfig;
  