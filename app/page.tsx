import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WallpaperGrid } from "@/components/wallpaper-grid"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Free Mobile Wallpapers - Download HD Phone Backgrounds",
  description:
    "Download thousands of free high-quality mobile wallpapers. Browse categories like nature, abstract, minimal, dark, and more. Perfect for iPhone and Android devices.",
  keywords: [
    "free mobile wallpapers",
    "HD phone backgrounds",
    "iPhone wallpapers",
    "Android wallpapers",
    "4K mobile wallpapers",
    "nature wallpapers",
    "abstract wallpapers",
    "minimal wallpapers",
  ],
  openGraph: {
    title: "Free Mobile Wallpapers - Download HD Phone Backgrounds",
    description:
      "Download thousands of free high-quality mobile wallpapers. Browse categories like nature, abstract, minimal, dark, and more.",
    url: "https://wallpaper-zone.vercel.app",
    images: [
      {
        url: "/og-home.jpg",
        width: 1200,
        height: 630,
        alt: "WALLPAPER ZONE Homepage",
      },
    ],
  },
  alternates: {
    canonical: "https://wallpaper-zone.vercel.app",
  },
}

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {/* Hero Section with SEO-optimized content */}
        <section className="mb-8 sm:mb-12">
          <div className="brutalist-border brutalist-shadow bg-secondary p-4 sm:p-8 mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black text-secondary-foreground mb-3 sm:mb-4 text-balance">
              WALLPAPER ZONE
            </h1>
            <p className="text-base sm:text-xl font-bold text-secondary-foreground text-pretty mb-3 sm:mb-4">
              FREE HIGH-QUALITY MOBILE WALLPAPERS. NO SIGNUP. NO BS.
            </p>
            <p className="text-sm sm:text-lg font-bold text-secondary-foreground text-pretty">
              Download thousands of HD wallpapers for iPhone and Android. Categories include nature, abstract, minimal,
              dark, colorful, space, animals, cars, and architecture.
            </p>
          </div>

          <SearchBar />
        </section>

        {/* Categories Section */}
        <section className="mb-6 sm:mb-8" aria-labelledby="categories-heading">
          <CategoryFilter />
        </section>

        {/* Featured Wallpapers Section */}
        <section aria-labelledby="wallpapers-heading">
          <div className="mb-4 sm:mb-6">
            <h2 id="wallpapers-heading" className="text-2xl sm:text-3xl font-black text-foreground mb-2">
              FEATURED WALLPAPERS
            </h2>
            <p className="text-base sm:text-lg font-bold text-muted-foreground">
              Discover our most popular and recently added mobile wallpapers
            </p>
          </div>
          <WallpaperGrid />
        </section>

        {/* SEO Content Section */}
        <section className="mt-12 sm:mt-16 brutalist-border brutalist-shadow bg-card p-4 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-black text-card-foreground mb-4 sm:mb-6">ABOUT WALLPAPER ZONE</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-sm sm:text-lg font-bold text-card-foreground mb-4">
              WALLPAPER ZONE is your ultimate destination for free, high-quality mobile wallpapers. We offer thousands
              of carefully curated wallpapers across multiple categories, all optimized for mobile devices.
            </p>
            <p className="text-sm sm:text-lg font-bold text-card-foreground mb-4">
              Our collection includes stunning nature photography, abstract art, minimal designs, dark themes perfect
              for OLED displays, colorful gradients, space imagery, animal portraits, automotive art, and architectural
              photography.
            </p>
            <p className="text-sm sm:text-lg font-bold text-card-foreground">
              All wallpapers are available in high resolution (1080x1920 and higher) and are completely free to
              download. No registration required, no watermarks, just pure quality wallpapers for your mobile device.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
