import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",

	turbopack: {
		root: __dirname
	},

	// Staff link pages contain a secret token in the URL.
	// no-referrer: the URL is never sent to other sites when a link is clicked.
	// X-Robots-Tag: search engines must not index these pages.
	async headers() {
		return [
			{
				source: "/s/:token",
				headers: [
					{ key: "Referrer-Policy", value: "no-referrer" },
					{ key: "X-Robots-Tag", value: "noindex, nofollow" }
				]
			}
		];
	}
};

export default nextConfig;
