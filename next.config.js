// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Any other Next.js configuration options you have
    reactStrictMode: true,
    swcMinify: true,
  
    webpack(config) {
      // Stub out Node.js core modules MongoDB driver depends on,
      // so that Next.js’s client-side bundle build won’t error.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
        fs: false,
        'fs/promises': false,
        child_process: false,
        'timers/promises': false,
      }
      return config
    },
  }
  
  module.exports = nextConfig
  