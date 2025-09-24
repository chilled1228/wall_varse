interface WallpaperStructuredDataProps {
  wallpaper: {
    id: number | string
    title: string
    category: string
    downloads: number
    likes: number
    imageUrl: string
    resolution: string
    tags: string[]
    fileSize: string
    description?: string
    slug?: string
  }
}

export function WallpaperStructuredData({ wallpaper }: WallpaperStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    name: wallpaper.title,
    description: wallpaper.description || `${wallpaper.title} - Free mobile wallpaper in ${wallpaper.category} category`,
    contentUrl: wallpaper.imageUrl,
    thumbnailUrl: wallpaper.imageUrl,
    width: wallpaper.resolution.split("x")[0],
    height: wallpaper.resolution.split("x")[1],
    encodingFormat: "image/jpeg",
    keywords: wallpaper.tags.join(", "),
    genre: wallpaper.category,
    interactionStatistic: [
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/DownloadAction",
        userInteractionCount: wallpaper.downloads,
      },
      {
        "@type": "InteractionCounter",
        interactionType: "https://schema.org/LikeAction",
        userInteractionCount: wallpaper.likes,
      },
    ],
    license: "https://creativecommons.org/publicdomain/zero/1.0/",
    acquireLicensePage: "https://wallpaper-zone.vercel.app",
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  )
}
