import { NextRequest, NextResponse } from 'next/server'
import { wallpaperService } from '@/lib/wallpaper-service'

// POST - Run slug migration
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting slug migration...')

    const result = await wallpaperService.addMissingSlugs()

    console.log('✅ Migration completed!')
    console.log(`📊 Updated ${result.updated} wallpapers with slugs`)

    if (result.errors.length > 0) {
      console.log('⚠️  Errors encountered:')
      result.errors.forEach(error => console.log(`   - ${error}`))
    }

    return NextResponse.json({
      success: true,
      updated: result.updated,
      errors: result.errors,
      message: `Successfully added slugs to ${result.updated} wallpapers${result.errors.length > 0 ? ` with ${result.errors.length} errors` : ''}`
    })

  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET - Check migration status
export async function GET() {
  try {
    const wallpapers = await wallpaperService.getAllWallpapers()
    const withoutSlugs = wallpapers.filter(w => !w.slug)
    const withSlugs = wallpapers.filter(w => w.slug)

    return NextResponse.json({
      success: true,
      total: wallpapers.length,
      withSlugs: withSlugs.length,
      withoutSlugs: withoutSlugs.length,
      migrationNeeded: withoutSlugs.length > 0,
      sampleWithoutSlugs: withoutSlugs.slice(0, 3).map(w => ({
        id: w.id,
        title: w.title
      })),
      sampleWithSlugs: withSlugs.slice(0, 3).map(w => ({
        id: w.id,
        title: w.title,
        slug: w.slug
      }))
    })
  } catch (error) {
    console.error('Error checking migration status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check migration status'
      },
      { status: 500 }
    )
  }
}