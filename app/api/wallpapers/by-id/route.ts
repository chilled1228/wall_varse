import { NextRequest, NextResponse } from 'next/server'
import { wallpaperService } from '@/lib/wallpaper-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id parameter' },
        { status: 400 }
      )
    }

    const wallpaper = await wallpaperService.getWallpaperById(id)

    if (!wallpaper) {
      return NextResponse.json(
        { error: 'Wallpaper not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      wallpaper: wallpaper
    })
  } catch (error) {
    console.error('Error getting wallpaper:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}