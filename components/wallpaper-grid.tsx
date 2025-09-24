"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Heart, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import type { WallpaperWithId } from "@/lib/wallpaper-service"

interface WallpaperGridProps {
  category?: string
  searchQuery?: string
}

export function WallpaperGrid({ category, searchQuery }: WallpaperGridProps) {
  const [wallpapers, setWallpapers] = useState<WallpaperWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [likedWallpapers, setLikedWallpapers] = useState<Set<string>>(new Set())
  const [downloadingWallpapers, setDownloadingWallpapers] = useState<Set<string>>(new Set())
  const { toast } = useToast()

  // Load wallpapers from API
  useEffect(() => {
    const loadWallpapers = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (searchQuery && searchQuery.trim()) {
          params.append('search', searchQuery.trim())
        }
        if (category && category !== "all") {
          params.append('category', category)
        }

        const response = await fetch(`/api/wallpapers?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to load wallpapers')
        }

        const data = await response.json()
        setWallpapers(data.wallpapers || [])
      } catch (err) {
        console.error("Error loading wallpapers:", err)
        setError("Failed to load wallpapers. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadWallpapers()
  }, [category, searchQuery])

  const toggleLike = async (wallpaper: WallpaperWithId) => {
    const newLiked = new Set(likedWallpapers)
    const isCurrentlyLiked = newLiked.has(wallpaper.id)

    try {
      const response = await fetch(`/api/wallpapers/${wallpaper.id}/like`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to update like')
      }

      if (isCurrentlyLiked) {
        newLiked.delete(wallpaper.id)
      } else {
        newLiked.add(wallpaper.id)
      }

      setLikedWallpapers(newLiked)

      toast({
        title: !isCurrentlyLiked ? "WALLPAPER LIKED!" : "WALLPAPER UNLIKED!",
        description: !isCurrentlyLiked ? "Added to your favorites" : "Removed from favorites",
      })
    } catch (error) {
      console.error("Error updating likes:", error)
      toast({
        title: "ERROR!",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (wallpaper: WallpaperWithId) => {
    setDownloadingWallpapers((prev) => new Set(prev).add(wallpaper.id))

    try {
      // Increment download count
      const response = await fetch(`/api/wallpapers/${wallpaper.id}/download`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to increment download count')
      }

      // Use the R2 URL directly for download
      const link = document.createElement("a")
      link.href = wallpaper.imageUrl
      link.download = `${wallpaper.title.replace(/\s+/g, "_")}_${wallpaper.resolution}.jpg`
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "DOWNLOAD STARTED!",
        description: `${wallpaper.title} is downloading...`,
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "DOWNLOAD FAILED!",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setDownloadingWallpapers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(wallpaper.id)
        return newSet
      })
    }
  }

  const handlePreview = (wallpaper: WallpaperWithId) => {
    window.open(wallpaper.imageUrl, "_blank")
  }

  // Loading state
  if (loading) {
    return (
      <div className="brutalist-border brutalist-shadow bg-card p-12 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h3 className="text-3xl font-black text-card-foreground mb-4">LOADING WALLPAPERS...</h3>
        <p className="text-lg font-bold text-muted-foreground">Please wait while we fetch the latest wallpapers</p>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="brutalist-border brutalist-shadow bg-card p-12 text-center">
        <h3 className="text-3xl font-black text-card-foreground mb-4">ERROR LOADING WALLPAPERS</h3>
        <p className="text-lg font-bold text-muted-foreground mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="brutalist-border brutalist-shadow font-black"
        >
          RETRY
        </Button>
      </div>
    )
  }

  // No wallpapers found
  if (wallpapers.length === 0) {
    return (
      <div className="brutalist-border brutalist-shadow bg-card p-12 text-center">
        <h3 className="text-3xl font-black text-card-foreground mb-4">NO WALLPAPERS FOUND</h3>
        <p className="text-lg font-bold text-muted-foreground">
          {searchQuery
            ? `NO RESULTS FOR "${searchQuery.toUpperCase()}"`
            : category
              ? `NO WALLPAPERS IN ${category.toUpperCase()} CATEGORY`
              : "NO WALLPAPERS AVAILABLE"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {wallpapers.map((wallpaper) => (
        <div key={wallpaper.id} className="brutalist-border brutalist-shadow bg-card">
          {/* Image container */}
          <Link href={`/wallpaper-page/${wallpaper.slug || wallpaper.id}`}>
            <div className="relative aspect-[2/3] overflow-hidden group cursor-pointer">
              <img
                src={wallpaper.imageUrl || "/placeholder.svg"}
                alt={wallpaper.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
                <div className="brutalist-border bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <span className="text-xs font-black text-secondary-foreground">{wallpaper.resolution}</span>
                </div>
              </div>
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4">
                <div className="brutalist-border bg-card px-1.5 sm:px-2 py-0.5 sm:py-1">
                  <span className="text-xs font-black text-card-foreground">{wallpaper.fileSize}</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" className="brutalist-border font-black text-xs sm:text-sm">
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  VIEW
                </Button>
              </div>
            </div>
          </Link>

          {/* Content */}
          <div className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm sm:text-lg font-black text-card-foreground truncate">{wallpaper.title}</h4>
              <span className="brutalist-border bg-accent px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-black text-accent-foreground">
                {wallpaper.category.toUpperCase()}
              </span>
            </div>

            {/* Description */}
            {wallpaper.description && (
              <p className="text-xs sm:text-sm text-muted-foreground font-bold mb-3 line-clamp-2">
                {wallpaper.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-bold">{wallpaper.downloads.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="font-bold">{wallpaper.likes}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleDownload(wallpaper)}
                disabled={downloadingWallpapers.has(wallpaper.id)}
                className="flex-1 brutalist-border brutalist-shadow font-black text-xs sm:text-sm"
                size="sm"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                {downloadingWallpapers.has(wallpaper.id) ? "DOWNLOADING..." : "DOWNLOAD"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleLike(wallpaper)}
                className={`brutalist-border ${
                  likedWallpapers.has(wallpaper.id) ? "bg-destructive text-destructive-foreground" : ""
                }`}
              >
                <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${likedWallpapers.has(wallpaper.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
