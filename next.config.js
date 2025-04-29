// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    // Other Next.js config…
  
    webpack: (config) => {
      // Stub out Node.js built-in modules that mongodb pulls in
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        'child_process': false,
        'fs/promises': false,
      }
      return config
    },
  }
  
  module.exports = nextConfig
  