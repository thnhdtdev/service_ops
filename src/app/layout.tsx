import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import "@/style/globals.css";
import { ThemeProvider } from "@/components/theme-provider"

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin","vietnamese"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ServiceOps",
  description: "Order management system for laundry and shoe care operations.",
  icons: {
    icon: "/favicons.png",
    shortcut: "/favicons.png",
    apple: "/favicons.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} h-full`}>
      <body>
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange>
        {children}
        </ThemeProvider>
        </body>
    </html>
  );
}
