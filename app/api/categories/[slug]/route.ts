import { NextRequest, NextResponse } from 'next/server'
import { wallpaperService } from '@/lib/wallpaper-service'
import { getCategoryBySlug } from '@/lib/dynamic-category-service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get category metadata (works for both predefined and dynamic categories)
    const categoryData = await getCategoryBySlug(slug)

    if (!categoryData) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    // Get wallpapers for this category using the slug directly
    const wallpapers = await wallpaperService.getWallpapersByCategory(slug)

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedWallpapers = wallpapers.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      category: {
        key: slug, // Use slug as key for consistency
        slug: categoryData.slug,
        name: categoryData.name,
        description: categoryData.description,
        seoTitle: categoryData.seoTitle,
        count: categoryData.count,
        featured: categoryData.featured,
        isPredefined: categoryData.isPredefined
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