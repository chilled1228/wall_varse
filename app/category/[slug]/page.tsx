import { notFound } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { WallpaperGrid } from "@/components/wallpaper-grid"
import { getCategoryBySlug, generateBreadcrumbs, type CategoryKey } from "@/lib/slug-utils"
import type { Metadata } from "next"

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

interface CategoryData {
  key: CategoryKey
  slug: string
  name: string
  description: string
  seoTitle: string
  wallpaper_count?: number
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    // Validate category slug locally first
    const categoryInfo = getCategoryBySlug(slug)
    if (!categoryInfo) {
      return {
        title: 'Category Not Found | WALLPAPER ZONE',
        description: 'The requested category could not be found.'
      }
    }

    // Fetch category data for metadata
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories/${encodeURIComponent(slug)}`)

    if (!response.ok) {
      return {
        title: 'Category Not Found | WALLPAPER ZONE',
        description: 'The requested category could not be found.'
      }
    }

    const result = await response.json()
    const category = result.category

    if (!category) {
      return {
        title: 'Category Not Found | WALLPAPER ZONE',
        description: 'The requested category could not be found.'
      }
    }

    const title = `${category.name.toUpperCase()} Wallpapers - Free Mobile & Desktop Backgrounds | WALLPAPER ZONE`
    const description = `Download ${category.description.toLowerCase()}. Browse our collection of ${result.wallpapers?.length || 'amazing'} high-quality ${category.name.toLowerCase()} wallpapers for mobile and desktop. All wallpapers are free to download.`

    return {
      title,
      description,
      keywords: [
        category.name.toLowerCase(),
        'wallpapers',
        'backgrounds',
        'mobile wallpapers',
        'desktop wallpapers',
        'hd wallpapers',
        'free download',
        '4k wallpapers'
      ].join(', '),
      openGraph: {
        title,
        description,
        type: 'website',
        url: `/category/${slug}`,
        siteName: 'WALLPAPER ZONE',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      alternates: {
        canonical: `/category/${slug}`,
      },
    }
  } catch (error) {
    console.error('Error generating category metadata:', error)
    return {
      title: 'Category | WALLPAPER ZONE',
      description: 'Browse our collection of high-quality wallpapers.'
    }
  }
}

async function getCategoryData(slug: string): Promise<{ category: CategoryData; wallpapers: any[] } | null> {
  try {
    // Validate category slug locally first
    const categoryInfo = getCategoryBySlug(slug)
    if (!categoryInfo) {
      return null
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()

    if (!result.success || !result.category) {
      return null
    }

    return {
      category: result.category,
      wallpapers: result.wallpapers || []
    }
  } catch (error) {
    console.error('Error loading category data:', error)
    return null
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const data = await getCategoryData(slug)

  if (!data) {
    notFound()
  }

  const { category, wallpapers } = data
  const breadcrumbs = generateBreadcrumbs(category.key)

  return (
    <>
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && <span>/</span>}
              {crumb.url === '#' ? (
                <span className="font-bold text-foreground">{crumb.name}</span>
              ) : (
                <Link href={crumb.url} className="hover:text-foreground transition-colors">
                  {crumb.name}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
                {category.name.toUpperCase()} WALLPAPERS
              </h1>
              <p className="text-lg font-bold text-muted-foreground max-w-3xl">
                {category.description}
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="brutalist-border font-bold bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                ALL CATEGORIES
              </Button>
            </Link>
          </div>

          <div className="text-sm font-bold text-muted-foreground">
            {wallpapers.length} wallpaper{wallpapers.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Wallpapers Grid */}
        <WallpaperGrid
          category={category.key}
          searchQuery=""
        />
      </main>

      <Footer />
    </>
  )
}
