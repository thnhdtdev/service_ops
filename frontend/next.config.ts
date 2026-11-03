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
			},
			{
				// The phone must always get the latest service worker,
				// and the worker may only load scripts from this site.
				source: "/sw.js",
				headers: [
					{ key: "Content-Type", value: "application/javascript; charset=utf-8" },
					{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
					{
						key: "Content-Security-Policy",
						value: "default-src 'self'; script-src 'self'"
					}
				]
			}
		];
	}
};

export default nextConfig;
