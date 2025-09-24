"use client"

import { useState, useEffect } from "react"
import React from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { WallpaperGrid } from "@/components/wallpaper-grid"
import { getCategoryBySlug, generateBreadcrumbs, type CategoryKey } from "@/lib/slug-utils"
import type { WallpaperWithId } from "@/lib/wallpaper-service"

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
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const router = useRouter()
  const [category, setCategory] = useState<CategoryData | null>(null)
  const [wallpapers, setWallpapers] = useState<WallpaperWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Unwrap params Promise for Next.js 15
  const unwrappedParams = React.use(params)

  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        setLoading(true)
        setError(null)

        // First, validate the category slug locally
        const categoryInfo = getCategoryBySlug(unwrappedParams.slug)
        if (!categoryInfo) {
          setError('Category not found')
          return
        }

        // Fetch category data and wallpapers from API
        const response = await fetch(`/api/categories/${unwrappedParams.slug}`)
        const result = await response.json()

        if (!response.ok || !result.success) {
          setError(result.error || 'Failed to load category')
          return
        }

        setCategory(result.category)
        setWallpapers(result.wallpapers)
      } catch (err) {
        console.error('Error loading category:', err)
        setError('Failed to load category')
      } finally {
        setLoading(false)
      }
    }

    loadCategoryData()
  }, [unwrappedParams.slug])

  // Generate page metadata
  useEffect(() => {
    if (category) {
      document.title = category.seoTitle

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      if (metaDescription) {
        metaDescription.setAttribute('content', category.description)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = category.description
        document.head.appendChild(meta)
      }
    }
  }, [category])

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-bold text-muted-foreground">Loading category...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (error || !category) {
    return (
      <>
        <Header />
        <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-black text-foreground mb-4">CATEGORY NOT FOUND</h1>
            <p className="text-lg font-bold text-muted-foreground mb-6">
              {error || "The category you're looking for doesn't exist."}
            </p>
            <Button
              onClick={() => router.push('/')}
              className="brutalist-border brutalist-shadow font-black"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              BACK TO HOME
            </Button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

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
          initialWallpapers={wallpapers}
          category={category.key}
          searchQuery=""
        />
      </main>

      <Footer />
    </>
  )
}
