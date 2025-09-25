import { NextResponse } from "next/server"
import { getAllDynamicCategories, getFeaturedCategories } from "@/lib/dynamic-category-service"

export async function GET() {
  try {
    const categories = await getAllDynamicCategories()
    const featured = await getFeaturedCategories()

    return NextResponse.json({
      success: true,
      categories: categories.map(cat => ({
        slug: cat.slug,
        name: cat.name.toUpperCase(),
        description: cat.description,
        count: cat.count,
        featured: cat.featured,
      })),
      total: categories.length,
      featured: featured.map(cat => ({
        slug: cat.slug,
        name: cat.name.toUpperCase(),
        description: cat.description,
        count: cat.count,
        featured: cat.featured,
      })),
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
