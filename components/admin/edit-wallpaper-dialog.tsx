"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Edit, X, Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllCategories } from "@/lib/slug-utils"
import type { WallpaperWithId } from "@/lib/wallpaper-service"

interface EditWallpaperDialogProps {
  wallpaper: WallpaperWithId
  onSuccess?: (updatedWallpaper: WallpaperWithId) => void
  trigger?: React.ReactNode
}

const categories = getAllCategories().map(cat => cat.key)

const commonResolutions = [
  '1080x1920',
  '1440x2560',
  '1125x2436',
  '1284x2778',
  '2160x3840',
]

const deviceTypes = [
  'phone',
  'tablet',
  'desktop',
]

export function EditWallpaperDialog({ wallpaper, onSuccess, trigger }: EditWallpaperDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: wallpaper.title,
    description: wallpaper.description || '',
    category: wallpaper.category,
    resolution: wallpaper.resolution,
    deviceType: wallpaper.deviceType || 'phone',
    customResolution: '',
  })
  const [tagsList, setTagsList] = useState<string[]>(wallpaper.tags || [])
  const [currentTag, setCurrentTag] = useState('')

  const { toast } = useToast()

  // Reset form when wallpaper changes
  useEffect(() => {
    setFormData({
      title: wallpaper.title,
      description: wallpaper.description || '',
      category: wallpaper.category,
      resolution: wallpaper.resolution,
      deviceType: wallpaper.deviceType || 'phone',
      customResolution: '',
    })
    setTagsList(wallpaper.tags || [])
    setCurrentTag('')
  }, [wallpaper])

  const handleAddTag = () => {
    if (currentTag.trim() && !tagsList.includes(currentTag.trim().toLowerCase())) {
      const newTag = currentTag.trim().toLowerCase()
      setTagsList(prev => [...prev, newTag])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.category) {
      toast({
        title: "MISSING FIELDS",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: tagsList,
        resolution: formData.customResolution || formData.resolution,
        deviceType: formData.deviceType,
      }

      const response = await fetch(`/api/admin/wallpapers/${wallpaper.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "WALLPAPER UPDATED!",
          description: `${formData.title} has been updated successfully`,
        })

        setOpen(false)
        onSuccess?.(result.wallpaper)
      } else {
        throw new Error(result.error || 'Update failed')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        title: "UPDATE FAILED",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const defaultTrigger = (
    <Button size="sm" variant="outline" className="brutalist-border font-bold text-xs">
      <Edit className="h-3 w-3 mr-1" />
      EDIT
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="brutalist-border brutalist-shadow bg-card max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-card-foreground">
            EDIT WALLPAPER
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preview */}
          <div className="w-full h-48 brutalist-border bg-secondary overflow-hidden">
            <img
              src={wallpaper.imageUrl}
              alt={wallpaper.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="edit-title" className="text-sm font-bold text-card-foreground">
              TITLE *
            </Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="ENTER WALLPAPER TITLE"
              className="brutalist-border font-bold"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit-description" className="text-sm font-bold text-card-foreground">
              DESCRIPTION
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="ENTER WALLPAPER DESCRIPTION (OPTIONAL)"
              className="brutalist-border font-bold resize-none"
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-card-foreground">
              CATEGORY *
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="brutalist-border font-bold">
                <SelectValue placeholder="SELECT CATEGORY" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="font-bold">
                    {category.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Resolution */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-card-foreground">
              RESOLUTION
            </Label>
            <div className="space-y-2">
              <Select
                value={formData.resolution}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, resolution: value, customResolution: '' }))
                }}
              >
                <SelectTrigger className="brutalist-border font-bold">
                  <SelectValue placeholder="SELECT RESOLUTION" />
                </SelectTrigger>
                <SelectContent>
                  {commonResolutions.map((res) => (
                    <SelectItem key={res} value={res} className="font-bold">
                      {res}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="font-bold">
                    CUSTOM
                  </SelectItem>
                </SelectContent>
              </Select>

              {formData.resolution === 'custom' && (
                <Input
                  value={formData.customResolution}
                  onChange={(e) => setFormData(prev => ({ ...prev, customResolution: e.target.value }))}
                  placeholder="1080x1920"
                  className="brutalist-border font-bold"
                />
              )}
            </div>
          </div>

          {/* Device Type */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-card-foreground">
              DEVICE TYPE
            </Label>
            <Select
              value={formData.deviceType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, deviceType: value }))}
            >
              <SelectTrigger className="brutalist-border font-bold">
                <SelectValue placeholder="SELECT DEVICE TYPE" />
              </SelectTrigger>
              <SelectContent>
                {deviceTypes.map((device) => (
                  <SelectItem key={device} value={device} className="font-bold">
                    {device.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-card-foreground">
              TAGS
            </Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="ADD TAG AND PRESS ENTER"
                  className="brutalist-border font-bold"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  className="brutalist-border font-bold"
                >
                  ADD
                </Button>
              </div>

              {tagsList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="brutalist-border flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 brutalist-border font-bold"
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 brutalist-border brutalist-shadow font-black"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  UPDATING...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  UPDATE WALLPAPER
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}