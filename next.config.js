// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
  
    
  
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
  