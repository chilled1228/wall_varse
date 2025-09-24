import { NextRequest, NextResponse } from 'next/server'
import { wallpaperService } from '@/lib/wallpaper-service'
import { getCategoryKeyBySlug, getCategoryBySlug } from '@/lib/slug-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const categoryKey = getCategoryKeyBySlug(slug)

    if (!categoryKey) {
      return NextResponse.json(
        { success: false, error: 'Invalid category slug' },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    // Get wallpapers for this category
    const wallpapers = await wallpaperService.getWallpapersByCategory(categoryKey)

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedWallpapers = wallpapers.slice(startIndex, endIndex)

    // Get category metadata
    const categoryData = getCategoryBySlug(slug)

    return NextResponse.json({
      success: true,
      category: {
        key: categoryKey,
        ...categoryData
      },
      wallpapers: paginatedWallpapers,
      pagination: {
        page,
        limit,
        total: wallpapers.length,
        totalPages: Math.ceil(wallpapers.length / limit),
        hasNext: endIndex < wallpapers.length,
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error('Error getting category wallpapers:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}