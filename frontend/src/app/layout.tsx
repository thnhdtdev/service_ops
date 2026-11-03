import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import "@/style/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";

const montserrat = Montserrat({
	variable: "--font-montserrat",
	subsets: ["latin", "vietnamese"],
	weight: ["400", "500", "600", "700"]
});

export const metadata: Metadata = {
	metadataBase: new URL("https://www.skyblue.io.vn"),
	title: {
		default: "ServiceOps – Quản lý giặt ủi & chăm sóc giày",
		template: "%s | ServiceOps"
	},
	description:
		"Quản lý đơn hàng, khách hàng, thanh toán và lịch làm nhân viên cho tiệm giặt ủi và chăm sóc giày.",
	applicationName: "ServiceOps",
	openGraph: {
		type: "website",
		locale: "vi_VN",
		url: "/",
		siteName: "ServiceOps",
		title: "ServiceOps – Quản lý giặt ủi & chăm sóc giày",
		description:
			"Quản lý đơn hàng, khách hàng, thanh toán và lịch làm nhân viên cho tiệm giặt ủi và chăm sóc giày."
	},
	twitter: {
		card: "summary_large_image",
		title: "ServiceOps – Quản lý giặt ủi & chăm sóc giày",
		description:
			"Quản lý đơn hàng, khách hàng, thanh toán và lịch làm nhân viên cho tiệm giặt ủi và chăm sóc giày."
	},
	robots: {
		index: false,
		follow: false
	},
	icons: {
		icon: "/favicons.png",
		shortcut: "/favicons.png",
		// iPhone home screen icon, served from app/apple-icon.png (180x180).
		apple: "/apple-icon.png"
	},
	// Name under the icon on the iPhone home screen; opens full screen.
	appleWebApp: {
		capable: true,
		title: "ServiceOps",
		statusBarStyle: "default"
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="vi" suppressHydrationWarning className={`${montserrat.variable} h-full`}>
			<body>
				<ThemeProvider defaultTheme="system">
					<ToastProvider>{children}</ToastProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
