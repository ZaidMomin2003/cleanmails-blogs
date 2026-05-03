/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/blog',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
  },
}

module.exports = nextConfig
