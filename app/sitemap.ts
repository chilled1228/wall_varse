import type { MetadataRoute } from "next"

const categories = ["nature", "abstract", "minimal", "dark", "colorful", "space", "animals", "cars", "architecture"]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://wallpaper-zone.vercel.app" // Replace with your actual domain

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]

  // Category pages
  const categoryPages = categories.map((category) => ({
    url: `${baseUrl}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }))

  return [...staticPages, ...categoryPages]
}
