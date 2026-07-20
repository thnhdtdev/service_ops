import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import "@/style/globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const montserrat = Montserrat({
	variable: "--font-montserrat",
	subsets: ["latin", "vietnamese"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
	title: "ServiceOps",
	description: "Hệ thống quản lý đơn hàng giặt ủi và chăm sóc giày.",
	icons: {
		icon: "/favicons.png",
		shortcut: "/favicons.png",
		apple: "/favicons.png"
	}
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning className={`${montserrat.variable} h-full`}>
			<body>
				<ThemeProvider defaultTheme="system">{children}</ThemeProvider>
			</body>
		</html>
	);
}
