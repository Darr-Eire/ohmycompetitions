// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // ❌ remove any distDir here
  // distDir: 'build',
  experimental: { appDir: false }, // fine to leave
};

module.exports = nextConfig;
