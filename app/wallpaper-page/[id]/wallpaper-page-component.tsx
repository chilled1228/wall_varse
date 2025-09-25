"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Heart, Share2, ArrowLeft, Eye, Tag, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { generateBreadcrumbs, getCategoryKeyBySlug } from "@/lib/slug-utils"
import type { WallpaperWithId } from "@/lib/wallpaper-service"
import type { CategoryKey } from "@/lib/slug-utils"
import { siteConfig } from "@/lib/config"

interface WallpaperPageComponentProps {
  params: {
    id: string // This can now be either a slug or ID
  }
}

export function WallpaperPageComponent({ params }: WallpaperPageComponentProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [wallpaper, setWallpaper] = useState<WallpaperWithId | null>(null)
  const [relatedWallpapers, setRelatedWallpapers] = useState<WallpaperWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedWallpapers, setLikedWallpapers] = useState<Set<string>>(new Set())
  const [downloading, setDownloading] = useState(false)

  // Handle scroll restoration with Next.js compatibility
  useEffect(() => {
    // Simple scroll to top on mount to avoid conflicts
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  useEffect(() => {
    const abortController = new AbortController()

    const loadWallpaper = async () => {
      try {
        setLoading(true)
        setError(null)

        // Use the unified lookup API that handles both slugs and IDs with abort signal
        const wallpaperResponse = await fetch(`/api/wallpapers/lookup/${encodeURIComponent(params.id)}`, {
          signal: abortController.signal
        })

        if (abortController.signal.aborted) return

        const result = await wallpaperResponse.json()

        if (!wallpaperResponse.ok || !result.success) {
          setError(result.error || 'Wallpaper not found')
          return
        }

        setWallpaper(result.wallpaper)

        // Fetch related wallpapers from the same category
        try {
          const relatedResponse = await fetch(`/api/wallpapers?category=${result.wallpaper.category}&limit=4&exclude=${result.wallpaper.id}`, {
            signal: abortController.signal
          })

          if (abortController.signal.aborted) return

          if (relatedResponse.ok) {
            const relatedResult = await relatedResponse.json()
            if (relatedResult.success) {
              setRelatedWallpapers(relatedResult.wallpapers.filter((w: WallpaperWithId) => w.id !== result.wallpaper.id).slice(0, 4))
            }
          } else if (relatedResponse.status === 503) {
            // Service unavailable - index being created
            console.warn('Related wallpapers temporarily unavailable due to index creation')
          }
        } catch (relatedError) {
          if (relatedError.name === 'AbortError') return
          console.warn('Failed to load related wallpapers:', relatedError)
          // Don't fail the whole page if related wallpapers fail to load
        }
      } catch (err) {
        if (err.name === 'AbortError') return
        console.error('Error loading wallpaper:', err)
        setError('Failed to load wallpaper')
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadWallpaper()

    return () => {
      abortController.abort()
    }
  }, [params.id])

  // Update document title and meta tags
  useEffect(() => {
    if (wallpaper) {
      document.title = `${wallpaper.title} - ${wallpaper.category.toUpperCase()} Wallpaper | ${siteConfig.name}`

      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]')
      const description = wallpaper.description
        ? `${wallpaper.description} Download ${wallpaper.title} in ${wallpaper.resolution} resolution for ${wallpaper.deviceType || 'mobile'}.`
        : `Download ${wallpaper.title} - A beautiful ${wallpaper.category} wallpaper in ${wallpaper.resolution} resolution. Perfect for your ${wallpaper.deviceType || 'mobile'} device.`

      if (metaDescription) {
        metaDescription.setAttribute('content', description)
      } else {
        const meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = description
        document.head.appendChild(meta)
      }
    }
  }, [wallpaper])

  const handleDownload = async () => {
    if (!wallpaper) return

    setDownloading(true)
    try {
      // Increment download count
      await fetch(`/api/admin/wallpapers/${wallpaper.id}/increment-downloads`, {
        method: 'POST'
      })

      // Trigger download
      const link = document.createElement('a')
      link.href = wallpaper.imageUrl
      link.download = `${wallpaper.title.replace(/\s+/g, '_')}_${wallpaper.resolution}.jpg`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "DOWNLOAD STARTED!",
        description: `${wallpaper.title} is downloading...`,
      })
    } catch (error) {
      console.error('Download error:', error)
      toast({
        title: "DOWNLOAD FAILED!",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setDownloading(false)
    }
  }

  const toggleLike = async () => {
    if (!wallpaper) return

    const isLiked = likedWallpapers.has(wallpaper.id)
    const newLiked = new Set(likedWallpapers)

    if (isLiked) {
      newLiked.delete(wallpaper.id)
    } else {
      newLiked.add(wallpaper.id)
    }

    setLikedWallpapers(newLiked)

    try {
      await fetch(`/api/admin/wallpapers/${wallpaper.id}/${isLiked ? 'decrement' : 'increment'}-likes`, {
        method: 'POST'
      })

      toast({
        title: isLiked ? "WALLPAPER UNLIKED!" : "WALLPAPER LIKED!",
        description: isLiked ? "Removed from favorites" : "Added to your favorites",
      })
    } catch (error) {
      console.error('Like error:', error)
      // Revert the like state on error
      if (isLiked) {
        newLiked.add(wallpaper.id)
      } else {
        newLiked.delete(wallpaper.id)
      }
      setLikedWallpapers(newLiked)
    }
  }

  if (loading) {
    return (
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        {/* Match the normal layout structure during loading */}
        <div className="mb-6 h-6"></div> {/* Breadcrumb space */}
        <div className="mb-6 h-10"></div> {/* Back button space */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image skeleton */}
          <div className="space-y-4">
            <div className="brutalist-border brutalist-shadow bg-card">
              <div className="relative aspect-[2/3] flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-lg font-bold text-muted-foreground">Loading wallpaper...</p>
                </div>
              </div>
            </div>
          </div>

          {/* Details skeleton */}
          <div className="space-y-6">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded mb-4"></div>
              <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-muted rounded mb-4 w-1/2"></div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !wallpaper) {
    return (
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="text-center py-12">
          <h1 className="text-3xl font-black text-foreground mb-4">WALLPAPER NOT FOUND</h1>
          <p className="text-lg font-bold text-muted-foreground mb-6">
            {error || "The wallpaper you're looking for doesn't exist."}
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
    )
  }

  const categoryKey = getCategoryKeyBySlug(wallpaper.category) as CategoryKey
  const breadcrumbs = generateBreadcrumbs(categoryKey, wallpaper.title)

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

        {/* Back Button */}
        <div className="mb-6">
          <Link href={`/category/${wallpaper.category}`}>
            <Button variant="outline" className="brutalist-border font-bold bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              BACK TO {wallpaper.category.toUpperCase()}
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="brutalist-border brutalist-shadow bg-card overflow-hidden">
              <div className="relative aspect-[2/3]">
                <img
                  src={wallpaper.imageUrl || "/placeholder.svg"}
                  alt={wallpaper.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <div className="brutalist-border bg-secondary px-2 py-1">
                    <span className="text-xs font-black text-secondary-foreground">{wallpaper.resolution}</span>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                  <div className="brutalist-border bg-card px-2 py-1">
                    <span className="text-xs font-black text-card-foreground">{wallpaper.fileSize}</span>
                  </div>
                </div>
                {wallpaper.deviceType && (
                  <div className="absolute bottom-4 right-4">
                    <div className="brutalist-border bg-accent px-2 py-1">
                      <span className="text-xs font-black text-accent-foreground">{wallpaper.deviceType.toUpperCase()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="flex gap-2 lg:hidden">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 brutalist-border brutalist-shadow font-black"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    DOWNLOADING...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    DOWNLOAD
                  </>
                )}
              </Button>
              <Button
                onClick={toggleLike}
                variant="outline"
                size="icon"
                className={`brutalist-border bg-transparent ${
                  likedWallpapers.has(wallpaper.id) ? "bg-destructive text-destructive-foreground" : ""
                }`}
              >
                <Heart className={`h-4 w-4 ${likedWallpapers.has(wallpaper.id) ? "fill-current" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" className="brutalist-border bg-transparent">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">{wallpaper.title}</h1>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="brutalist-border bg-accent px-3 py-1 text-sm font-black text-accent-foreground">
                      {wallpaper.category.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {wallpaper.description && (
                <div className="mb-6">
                  <h2 className="text-xl font-black text-foreground mb-3">DESCRIPTION</h2>
                  <p className="text-base sm:text-lg font-bold text-muted-foreground leading-relaxed">
                    {wallpaper.description}
                  </p>
                </div>
              )}

            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="brutalist-border bg-secondary p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="h-4 w-4 text-secondary-foreground" />
                  <span className="text-sm font-black text-secondary-foreground">DOWNLOADS</span>
                </div>
                <div className="text-2xl font-black text-secondary-foreground">
                  {wallpaper.downloads.toLocaleString()}
                </div>
              </div>
              <div className="brutalist-border bg-card p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Eye className="h-4 w-4 text-card-foreground" />
                  <span className="text-sm font-black text-card-foreground">LIKES</span>
                </div>
                <div className="text-2xl font-black text-card-foreground">{wallpaper.likes}</div>
              </div>
            </div>

            {/* Details */}
            <div className="brutalist-border bg-card p-4 sm:p-6">
              <h3 className="text-xl font-black text-card-foreground mb-4">DETAILS</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground">Resolution:</span>
                  <span className="font-black text-card-foreground">{wallpaper.resolution}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground">File Size:</span>
                  <span className="font-black text-card-foreground">{wallpaper.fileSize}</span>
                </div>
                {wallpaper.deviceType && (
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-muted-foreground">Device Type:</span>
                    <span className="font-black text-card-foreground">{wallpaper.deviceType.toUpperCase()}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground">Upload Date:</span>
                  <span className="font-black text-card-foreground">
                    {wallpaper.createdAt ? (wallpaper.createdAt instanceof Date ? wallpaper.createdAt.toLocaleDateString() : new Date(wallpaper.createdAt).toLocaleDateString()) : 'Recent'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {wallpaper.tags && wallpaper.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-black text-foreground mb-3">TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {wallpaper.tags.map((tag) => (
                    <Link key={tag} href={`/search?q=${tag}`}>
                      <Button variant="outline" size="sm" className="brutalist-border font-bold bg-transparent">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.toUpperCase()}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Action Buttons */}
            <div className="hidden lg:flex gap-4">
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 brutalist-border brutalist-shadow font-black"
              >
                {downloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    DOWNLOADING...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    DOWNLOAD HD
                  </>
                )}
              </Button>
              <Button
                onClick={toggleLike}
                variant="outline"
                className={`brutalist-border font-bold bg-transparent ${
                  likedWallpapers.has(wallpaper.id) ? "bg-destructive text-destructive-foreground" : ""
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${likedWallpapers.has(wallpaper.id) ? "fill-current" : ""}`} />
                {likedWallpapers.has(wallpaper.id) ? "LIKED" : "LIKE"}
              </Button>
              <Button variant="outline" className="brutalist-border font-bold bg-transparent">
                <Share2 className="h-4 w-4 mr-2" />
                SHARE
              </Button>
            </div>
          </div>
        </div>

        {/* Related Wallpapers */}
        {relatedWallpapers.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-6">RELATED WALLPAPERS</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedWallpapers.map((relatedWallpaper) => (
                <Link key={relatedWallpaper.id} href={`/wallpaper-page/${relatedWallpaper.slug || relatedWallpaper.id}`}>
                  <div className="brutalist-border brutalist-shadow bg-card overflow-hidden hover:scale-105 transition-transform">
                    <div className="relative aspect-[2/3]">
                      <img
                        src={relatedWallpaper.imageUrl || "/placeholder.svg"}
                        alt={relatedWallpaper.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-black text-card-foreground truncate">{relatedWallpaper.title}</h4>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
    </main>
  )
}