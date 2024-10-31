/** @type {import('next').NextConfig} */
const nextConfig = {
	output: "standalone",
	async rewrites() {
		return [
			{
				source: "/api/v1/app/:path*",  // Adjust the source to match the full path
				destination: "http://api:8000/api/v1/app/:path*", // Explicitly map to exact path
			},
		];
	},
};

export default nextConfig;
