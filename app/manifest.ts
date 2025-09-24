import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WALLPAPER ZONE - Free Mobile Wallpapers",
    short_name: "WALLPAPER ZONE",
    description:
      "Download high-quality mobile wallpapers for free. Categories include nature, abstract, minimal, and more.",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#0a0a0a",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    categories: ["entertainment", "lifestyle", "personalization"],
  }
}
