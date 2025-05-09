/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
	env: {
		NEXT_PUBLIC_APP_VERSION: version,
	},
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
