/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Do NOT set distDir
  // Do NOT set output: 'export'
  // Remove experimental.appDir (App Router is on by default)

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      // If you have any other external image domains, add them here
      // Example:
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/path/to/your/images/**',
      // },
    ],
  },
};

module.exports = nextConfig;