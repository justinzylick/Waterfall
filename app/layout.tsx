import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Chart Lab",
  description: "Create presentation-ready charts that Excel and PowerPoint can't. Waterfall, Marimekko, and Tornado charts for strategic customer presentations.",
  icons: {
    icon: "/diageo-logo-black.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Figtree:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-white dark:bg-gray-950`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
