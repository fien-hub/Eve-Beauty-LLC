import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppBanner from "@/components/AppBanner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://evebeauty.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Eve Beauty - Beauty & Wellness Services On-Demand",
    template: "%s | Eve Beauty",
  },
  description: "Book beauty and wellness services from verified providers near you. Hair, nails, makeup, massage, and more - all at your doorstep. A service by Eve Beauty LLC.",
  keywords: ["beauty services", "wellness", "hair styling", "nail salon", "makeup artist", "massage", "mobile beauty", "on-demand beauty", "Eve Beauty"],
  authors: [{ name: "Eve Beauty LLC" }],
  creator: "Eve Beauty LLC",
  publisher: "Eve Beauty LLC",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Eve Beauty",
    title: "Eve Beauty - Beauty & Wellness Services On-Demand",
    description: "Book beauty and wellness services from verified providers near you. Hair, nails, makeup, massage, and more. A service by Eve Beauty LLC.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Eve Beauty - Beauty & Wellness Services",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Eve Beauty - Beauty & Wellness Services On-Demand",
    description: "Book beauty and wellness services from verified providers near you.",
    images: ["/og-image.png"],
    creator: "@evebeautyapp",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4B5A4' },
    { media: '(prefers-color-scheme: dark)', color: '#1A1A1A' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="font-sans antialiased">
        <AppBanner />
        {children}
      </body>
    </html>
  );
}
