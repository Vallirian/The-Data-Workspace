/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	async rewrites() {
		return [
			{
				source: "/api/:path*",
				destination: "http://api:8000/api/v1/app/:path*", // Proxy to Kubernetes service
			},
		];
	},
};

export default nextConfig;
