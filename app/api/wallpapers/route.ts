import { type NextRequest, NextResponse } from "next/server"
import { wallpaperService } from "@/lib/wallpaper-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const exclude = searchParams.get("exclude")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    let wallpapers

    // Get wallpapers based on filters
    if (search && search.trim()) {
      wallpapers = await wallpaperService.searchWallpapers(search.trim())
    } else if (category && category !== "all") {
      wallpapers = await wallpaperService.getWallpapersByCategory(category)
    } else {
      wallpapers = await wallpaperService.getAllWallpapers()
    }

    // Exclude specific wallpaper by ID if requested
    if (exclude) {
      wallpapers = wallpapers.filter(w => w.id !== exclude)
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedWallpapers = wallpapers.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
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
    console.error('Error getting wallpapers:', error)

    // Provide more specific error message for Firebase index issues
    if (error && typeof error === 'object' && 'code' in error && error.code === 'failed-precondition') {
      return NextResponse.json(
        {
          success: false,
          error: 'Database index is being created. Please try again in a few minutes.',
          details: 'This is a one-time setup process for better performance.'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to load wallpapers' },
      { status: 500 }
    )
  }
}
