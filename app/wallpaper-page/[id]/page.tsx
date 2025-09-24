import { WallpaperPageComponent } from "@/app/wallpaper-page/[id]/wallpaper-page-component"

interface WallpaperPageProps {
  params: Promise<{
    id: string // This can now be either a slug or ID
  }>
}

export default async function WallpaperPage({ params }: WallpaperPageProps) {
  const resolvedParams = await params
  return <WallpaperPageComponent params={resolvedParams} />
}