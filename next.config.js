/** @type {import('next').NextConfig} */
const nextConfig = {
  // No basePath — the reverse proxy on the main site handles /blog → this app
  // Routes in this app are at / and /[slug], not /blog/...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
}

module.exports = nextConfig
