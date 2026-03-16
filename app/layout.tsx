import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://pizzacity.com'),
  title: "Pizzacity - Fresh Pizza & Chicken Delivery",
  description: "Order the best pizza, chicken, and more with fast delivery. Fresh ingredients, bold flavors!",
  openGraph: {
    title: "Pizzacity - Fresh Pizza & Chicken Delivery",
    description: "Order the best pizza, chicken, and more with fast delivery. Fresh ingredients, bold flavors!",
    url: "https://pizzacity.com",
    siteName: "Pizzacity",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pizzacity - Fresh Pizza & Chicken Delivery",
    description: "Order the best pizza, chicken, and more with fast delivery. Fresh ingredients, bold flavors!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
