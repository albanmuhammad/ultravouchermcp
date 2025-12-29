import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { McpProvider } from "./_components/mcp/McpProvider";
import { Navbar } from "./_components/nav/Navbar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ultra Voucher MCP Demo",
  description: "Demo Ultra Voucher + Marketing Cloud Personalization",
  manifest: "https://r2.themcx.app/514008875/demomc/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ MCX Push script */}
        <Script
          src="https://r2.themcx.app/514008875/demomc/mcx-push.js"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <McpProvider />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
