import { NextRequest, NextResponse } from 'next/server'
import { wallpaperService } from '@/lib/wallpaper-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing wallpaper identifier',
          message: 'Please provide a wallpaper slug or ID'
        },
        { status: 400 }
      )
    }

    // Use the unified lookup method that handles both slugs and IDs
    const wallpaper = await wallpaperService.getWallpaperByIdentifier(identifier)

    if (!wallpaper) {
      return NextResponse.json(
        {
          success: false,
          error: 'Wallpaper not found',
          identifier,
          message: `No wallpaper found with identifier: ${identifier}`
        },
        { status: 404 }
      )
    }

    // Return success response with wallpaper data
    return NextResponse.json({
      success: true,
      wallpaper: {
        ...wallpaper,
        // Ensure we have the slug for URL generation
        slug: wallpaper.slug || identifier,
        // Generate canonical URL
        canonicalUrl: wallpaper.slug
          ? `/wallpaper-page/${wallpaper.slug}`
          : `/wallpaper-page/${identifier}`
      }
    })

  } catch (error) {
    console.error('Error in wallpaper lookup:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to lookup wallpaper',
        identifier: await params.then(p => p.id),
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}