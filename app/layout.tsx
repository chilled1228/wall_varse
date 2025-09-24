import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { AdminProvider } from "@/contexts/admin-context"
import ErrorBoundary from "@/components/error-boundary"
import GlobalErrorHandler from "@/components/global-error-handler"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "WALLPAPER ZONE - Free Mobile Wallpapers",
    template: "%s | WALLPAPER ZONE",
  },
  description:
    "Download high-quality mobile wallpapers for free. Categories include nature, abstract, minimal, dark, colorful, space, animals, cars, and architecture. No signup required.",
  generator: "v0.app",
  applicationName: "WALLPAPER ZONE",
  referrer: "origin-when-cross-origin",
  keywords: [
    "wallpapers",
    "mobile wallpapers",
    "free wallpapers",
    "phone backgrounds",
    "HD wallpapers",
    "4K wallpapers",
    "iPhone wallpapers",
    "Android wallpapers",
    "nature wallpapers",
    "abstract wallpapers",
    "minimal wallpapers",
    "dark wallpapers",
    "OLED wallpapers",
  ],
  authors: [{ name: "WALLPAPER ZONE" }],
  creator: "WALLPAPER ZONE",
  publisher: "WALLPAPER ZONE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://wallpaper-zone.vercel.app"), // Replace with your actual domain
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://wallpaper-zone.vercel.app",
    title: "WALLPAPER ZONE - Free Mobile Wallpapers",
    description:
      "Download high-quality mobile wallpapers for free. Categories include nature, abstract, minimal, and more. No signup required.",
    siteName: "WALLPAPER ZONE",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "WALLPAPER ZONE - Free Mobile Wallpapers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WALLPAPER ZONE - Free Mobile Wallpapers",
    description:
      "Download high-quality mobile wallpapers for free. Categories include nature, abstract, minimal, and more.",
    images: ["/og-image.jpg"],
    creator: "@wallpaperzone",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
    yandex: "your-yandex-verification-code", // Replace with actual verification code
    yahoo: "your-yahoo-verification-code", // Replace with actual verification code
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="light dark" />
        <link rel="canonical" href="https://wallpaper-zone.vercel.app" />

        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://picsum.photos" />

        {/* Structured data for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "WALLPAPER ZONE",
              description: "Download high-quality mobile wallpapers for free",
              url: "https://wallpaper-zone.vercel.app",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://wallpaper-zone.vercel.app/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              sameAs: ["https://twitter.com/wallpaperzone", "https://instagram.com/wallpaperzone"],
            }),
          }}
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <div className="min-h-screen flex flex-col bg-background">
          <ErrorBoundary>
            <AdminProvider>
              <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-black mb-4">LOADING...</div>
                  <div className="text-lg font-bold text-muted-foreground">Please wait</div>
                </div>
              </div>}>
                {children}
                <GlobalErrorHandler />
                <Toaster />
                <Analytics />
              </Suspense>
            </AdminProvider>
          </ErrorBoundary>
        </div>
      </body>
    </html>
  )
}
