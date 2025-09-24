import { NextRequest, NextResponse } from 'next/server'
import { wallpaperService } from '@/lib/wallpaper-service'
import { extractIdFromSlug } from '@/lib/slug-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Extract ID from slug
    const wallpaperId = extractIdFromSlug(params.slug)

    if (!wallpaperId) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallpaper slug' },
        { status: 400 }
      )
    }

    // Try to find by ID first (most reliable)
    let wallpaper = await wallpaperService.getWallpaperById(wallpaperId)

    // If not found by ID extraction, try to find by slug in database
    if (!wallpaper) {
      const allWallpapers = await wallpaperService.getAllWallpapers()
      wallpaper = allWallpapers.find(w => w.slug === params.slug) || null
    }

    if (!wallpaper) {
      return NextResponse.json(
        { success: false, error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      wallpaper: wallpaper
    })
  } catch (error) {
    console.error('Error getting wallpaper by slug:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}