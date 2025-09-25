import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { WallpaperGrid } from "@/components/wallpaper-grid"
import { getCategoryBySlug, type DynamicCategory } from "@/lib/dynamic-category-service"
import { wallpaperService } from "@/lib/wallpaper-service"
import type { Metadata } from "next"
import { siteConfig } from "@/lib/config"

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

interface CategoryData {
  key: string
  slug: string
  name: string
  description: string
  seoTitle: string
  count: number
  featured: boolean
  isPredefined: boolean
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    // Use direct service calls instead of HTTP requests to avoid URL conflicts
    const category = await getCategoryBySlug(slug)

    if (!category) {
      return {
        title: `Category Not Found | ${siteConfig.name}`,
        description: 'The requested category could not be found.'
      }
    }

    // Get wallpapers count for this category
    const wallpapers = await wallpaperService.getWallpapersByCategory(slug)

    const title = `${category.name.toUpperCase()} Wallpapers - Free Mobile & Desktop Backgrounds | ${siteConfig.name}`
    const description = `Download ${category.description.toLowerCase()}. Browse our collection of ${wallpapers.length || 'amazing'} high-quality ${category.name.toLowerCase()} wallpapers for mobile and desktop. All wallpapers are free to download.`

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
        siteName: siteConfig.name,
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
      title: `Category | ${siteConfig.name}`,
      description: 'Browse our collection of high-quality wallpapers.'
    }
  }
}

async function getCategoryData(slug: string): Promise<{ category: CategoryData; wallpapers: any[] } | null> {
  try {
    // Use direct service calls instead of HTTP requests to avoid URL conflicts
    const category = await getCategoryBySlug(slug)

    if (!category) {
      return null
    }

    // Get wallpapers for this category
    const wallpapers = await wallpaperService.getWallpapersByCategory(slug)

    return {
      category: {
        key: category.slug,
        slug: category.slug,
        name: category.name,
        description: category.description,
        seoTitle: category.seoTitle,
        count: category.count,
        featured: category.featured,
        isPredefined: category.isPredefined
      },
      wallpapers: wallpapers || []
    }
  } catch (error) {
    console.error('Error loading category data:', error)
    return null
  }
}

// Generate dynamic breadcrumbs
function generateDynamicBreadcrumbs(categoryName: string, categorySlug: string) {
  return [
    { name: 'Home', url: '/' },
    { name: categoryName, url: '#' } // Current page
  ]
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const data = await getCategoryData(slug)

  if (!data) {
    notFound()
  }

  const { category, wallpapers } = data
  const breadcrumbs = generateDynamicBreadcrumbs(category.name, category.slug)

  return (
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
          category={category.slug}
          searchQuery=""
        />
    </main>
  )
}
