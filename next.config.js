/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
	dangerouslyAllowSVG: true,
	images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '*',
        pathname: '/icons/**',
      },
    ],
  },
}

module.exports = nextConfig
