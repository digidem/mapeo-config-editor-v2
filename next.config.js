/** @type {import('next').NextConfig} */
const { version } = require('./package.json');

const nextConfig = {
	env: {
		NEXT_PUBLIC_APP_VERSION: version,
	},
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
		dangerouslyAllowSVG: true,
		contentDispositionType: 'attachment',
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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
