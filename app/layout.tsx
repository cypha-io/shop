import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://wigfactory.com'),
  title: {
    template: '%s | Wig Factory',
    default: 'Wig Factory - Premium Wigs & Hair',
  },
  description: "Shop premium wigs and hair pieces. Quality craftsmanship, bold styles, fast delivery.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Wig Factory - Premium Wigs & Hair",
    description: "Shop premium wigs and hair pieces. Quality craftsmanship, bold styles, fast delivery.",
    url: "https://wigfactory.com",
    siteName: "Wig Factory",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Wig Factory Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wig Factory - Premium Wigs & Hair",
    description: "Shop premium wigs and hair pieces. Quality craftsmanship, bold styles, fast delivery.",
    images: ["/logo.png"],
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
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
