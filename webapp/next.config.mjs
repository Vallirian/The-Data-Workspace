/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	trailingSlash: true,
	async rewrites() {
		return [
			{
				source: "/api/v1/app/:path*/",  // Adjust the source to match the full path
				destination: "http://api:8000/:path*/",  // Adjust the destination to match the full path
			},
		];

	},
};

export default nextConfig;
