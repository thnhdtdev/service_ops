import type { MetadataRoute } from "next";

// Served by Next.js at /manifest.webmanifest. It lets the app be added to the
// iPhone home screen and open full screen (standalone), which iOS requires
// before a web app may receive push notifications.
// The iOS home screen icon comes from app/apple-icon.png.
export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "/",
		name: "ServiceOps – Quản lý giặt ủi & chăm sóc giày",
		short_name: "ServiceOps",
		description:
			"Quản lý đơn hàng, khách hàng, thanh toán và lịch làm nhân viên cho tiệm giặt ủi và chăm sóc giày.",
		lang: "vi",
		start_url: "/",
		scope: "/",
		display: "standalone",
		// Same as --background in globals.css (light theme).
		background_color: "#f8fafc",
		theme_color: "#f8fafc",
		icons: [
			{
				src: "/icon-192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any"
			},
			{
				src: "/icon-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any"
			},
			{
				// Has extra padding so Android can crop it into a circle or squircle.
				src: "/icon-maskable-512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable"
			}
		]
	};
}
