import { WallpaperPageComponent } from "@/app/wallpaper-page/[id]/wallpaper-page-component"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"
import { wallpaperService } from "@/lib/wallpaper-service"

interface WallpaperPageProps {
  params: Promise<{
    id: string // This can now be either a slug or ID
  }>
}

export async function generateMetadata({ params }: WallpaperPageProps): Promise<Metadata> {
  const { id } = await params

  try {
    // Use direct service call instead of HTTP request to avoid URL conflicts
    const wallpaper = await wallpaperService.getWallpaperByIdentifier(id)

    if (!wallpaper) {
      return {
        title: `Wallpaper Not Found | ${siteConfig.name}`,
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
      title: `Wallpaper | ${siteConfig.name}`,
      description: `High-quality wallpaper from ${siteConfig.name}`
    }
  }
}

export default async function WallpaperPage({ params }: WallpaperPageProps) {
  const resolvedParams = await params
  return <WallpaperPageComponent params={resolvedParams} />
}