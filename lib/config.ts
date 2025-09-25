export const siteConfig = {
  name: "WallpapersVerse",
  shortName: "WallpapersVerse",
  description: "Download high-quality mobile wallpapers for free. Categories include nature, abstract, minimal, and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  ogImage: "/og.jpg",
  links: {
    twitter: "https://twitter.com/wallpapersverse",
    instagram: "https://instagram.com/wallpapersverse",
  },
}

export const envConfig = {
  isDevelopment: process.env.NODE_ENV === "development",
  isProduction: process.env.NODE_ENV === "production",
}