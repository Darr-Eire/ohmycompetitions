const nextTranslate = require('next-translate-plugin')

/** @type {import('next').NextConfig} */
const nextConfig = nextTranslate({
  reactStrictMode: false,  // disable strict mode to see full errors
  env: {
    MONGODB_URI: process.env.MONGO_DB_URL,
    PI_API_KEY: process.env.PI_API_KEY,
  },
  images: {
    domains: [
      'encrypted-tbn0.gstatic.com',
      'images.unsplash.com',
      'cdn.pixabay.com',
      'images.pexels.com',
      'via.placeholder.com',
      'imgur.com',
      'i.imgur.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'imgur.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
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
