import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"

const categories = ["nature", "abstract", "minimal", "dark", "colorful", "space", "animals", "cars", "architecture"]

export default function sitemap(): MetadataRoute.Sitemap {
  // Static pages
  const staticPages = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${siteConfig.url}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ]

  // Category pages
  const categoryPages = categories.map((category) => ({
    url: `${siteConfig.url}/category/${category}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }))

  return [...staticPages, ...categoryPages]
}
