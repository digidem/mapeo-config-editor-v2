/** @type {import('next').NextConfig} */
const nextConfig = {
	buildModules: [
		'@nuxtjs/pwa',
	],
	pwa: {
		icon: {
			source: 'public/mapeo.png',
		}
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
