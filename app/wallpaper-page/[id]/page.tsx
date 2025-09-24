import { WallpaperPageComponent } from "@/app/wallpaper-page/[id]/wallpaper-page-component"
import type { Metadata } from "next"

interface WallpaperPageProps {
  params: Promise<{
    id: string // This can now be either a slug or ID
  }>
}

export async function generateMetadata({ params }: WallpaperPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    // Fetch wallpaper data for metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/wallpapers/lookup/${encodeURIComponent(id)}`)

    if (!response.ok) {
      return {
        title: 'Wallpaper Not Found | WALLPAPER ZONE',
        description: 'The requested wallpaper could not be found.'
      }
    }

    const result = await response.json()
    const wallpaper = result.wallpaper

    if (!wallpaper) {
      return {
        title: 'Wallpaper Not Found | WALLPAPER ZONE',
        description: 'The requested wallpaper could not be found.'
      }
    }

    const title = `${wallpaper.title} - ${wallpaper.category.toUpperCase()} Wallpaper`
    const description = wallpaper.description
      ? `${wallpaper.description} Download ${wallpaper.title} in ${wallpaper.resolution} resolution for ${wallpaper.deviceType || 'mobile'}.`
      : `Download ${wallpaper.title} - A beautiful ${wallpaper.category} wallpaper in ${wallpaper.resolution} resolution. Perfect for your ${wallpaper.deviceType || 'mobile'} device.`

    return {
      title,
      description,
      keywords: [
        wallpaper.title.toLowerCase(),
        wallpaper.category,
        ...wallpaper.tags,
        'wallpaper',
        'download',
        wallpaper.resolution,
        wallpaper.deviceType || 'mobile'
      ].join(', '),
      openGraph: {
        title,
        description,
        images: [
          {
            url: wallpaper.imageUrl,
            width: parseInt(wallpaper.resolution.split('x')[0]),
            height: parseInt(wallpaper.resolution.split('x')[1]),
            alt: wallpaper.title,
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [wallpaper.imageUrl],
      },
      alternates: {
        canonical: `/wallpaper-page/${wallpaper.slug || id}`,
      },
    }
  } catch (error) {
    console.error('Error generating wallpaper metadata:', error)
    return {
      title: 'Wallpaper | WALLPAPER ZONE',
      description: 'High-quality wallpaper from WALLPAPER ZONE'
    }
  }
}

export default async function WallpaperPage({ params }: WallpaperPageProps) {
  const resolvedParams = await params
  return <WallpaperPageComponent params={resolvedParams} />
}