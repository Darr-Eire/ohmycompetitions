const nextTranslate = require('next-translate-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = nextTranslate({
  reactStrictMode: false,  // disable strict mode to see full errors
  env: {
    MONGODB_URI: process.env.MONGO_DB_URL,
    PI_API_KEY: process.env.PI_API_KEY,
  },
  webpack(config, { dev }) {
    // Stub out Node.js core modules MongoDB driver depends on,
    // so Next.js's client-side bundle build won't error on import.
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

    // In development, use eval sourcemaps so real errors show up
    if (dev) {
      config.devtool = 'eval'
    }

    return config
  },
})

module.exports = nextConfig
