/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
	output: 'standalone',
	images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.thenounproject.com',
        port: '',
        pathname: '/png/**',
      },
    ],
  },
}

module.exports = nextConfig
