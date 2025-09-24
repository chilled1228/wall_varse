"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { WallpaperWithId } from "@/lib/wallpaper-service"

interface DeleteWallpaperDialogProps {
  wallpaper: WallpaperWithId
  onSuccess?: (wallpaperId: string) => void
  trigger?: React.ReactNode
}

export function DeleteWallpaperDialog({ wallpaper, onSuccess, trigger }: DeleteWallpaperDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/wallpapers/${wallpaper.id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "WALLPAPER DELETED!",
          description: `${wallpaper.title} has been deleted successfully`,
        })

        onSuccess?.(wallpaper.id)
      } else {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: "DELETE FAILED",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button size="sm" variant="outline" className="brutalist-border font-bold text-xs">
      <Trash2 className="h-3 w-3 mr-1" />
      DELETE
    </Button>
  )

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent className="brutalist-border brutalist-shadow bg-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-black text-card-foreground">
            DELETE WALLPAPER
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Are you sure you want to delete <strong>"{wallpaper.title}"</strong>?
            <br />
            <br />
            This action cannot be undone. The wallpaper will be permanently removed from both the database and R2 storage.
            <br />
            <br />
            <span className="text-destructive font-bold">
              Downloads: {wallpaper.downloads.toLocaleString()} | Likes: {wallpaper.likes}
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Preview */}
        <div className="w-full h-32 brutalist-border bg-secondary overflow-hidden">
          <img
            src={wallpaper.imageUrl}
            alt={wallpaper.title}
            className="w-full h-full object-cover"
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="brutalist-border font-bold">
            CANCEL
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="brutalist-border brutalist-shadow font-black bg-destructive hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                DELETING...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                DELETE PERMANENTLY
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}