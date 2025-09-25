import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} - Free Mobile Wallpapers`,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    categories: ["entertainment", "lifestyle", "personalization"],
  }
}
