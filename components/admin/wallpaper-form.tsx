"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getAllCategories } from "@/lib/slug-utils"
import { SlugInput } from "./slug-input"

interface WallpaperFormProps {
  onSuccess?: (wallpaper: any) => void
  onCancel?: () => void
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

export function WallpaperForm({ onSuccess, onCancel }: WallpaperFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    resolution: '1080x1920',
    customResolution: '',
    deviceType: 'phone',
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [tagsList, setTagsList] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [slug, setSlug] = useState('')

  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      toast({
        title: "INVALID FILE TYPE",
        description: "Please select a JPEG, PNG, or WebP image",
        variant: "destructive",
      })
      return
    }

    // Validate file size (50MB max)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast({
        title: "FILE TOO LARGE",
        description: "Maximum file size is 50MB",
        variant: "destructive",
      })
      return
    }

    setFile(selectedFile)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)

    // Auto-fill title from filename if empty
    if (!formData.title) {
      const filename = selectedFile.name.split('.')[0]
      const cleanTitle = filename
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase())
      setFormData(prev => ({ ...prev, title: cleanTitle }))
    }
  }

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

    if (!file) {
      toast({
        title: "NO FILE SELECTED",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    if (!formData.title || !formData.category || !slug) {
      toast({
        title: "MISSING FIELDS",
        description: "Please fill in all required fields including slug",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('slug', slug)
      uploadFormData.append('tags', tagsList.join(','))
      uploadFormData.append('resolution', formData.customResolution || formData.resolution)
      uploadFormData.append('deviceType', formData.deviceType)

      const response = await fetch('/api/admin/wallpapers/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "WALLPAPER UPLOADED!",
          description: `${formData.title} has been added successfully`,
        })

        // Reset form
        setFormData({
          title: '',
          description: '',
          category: '',
          tags: '',
          resolution: '1080x1920',
          customResolution: '',
          deviceType: 'phone',
        })
        setFile(null)
        setPreview(null)
        setTagsList([])
        setCurrentTag('')
        setSlug('')

        onSuccess?.(result.wallpaper)
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "UPLOAD FAILED",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="brutalist-border brutalist-shadow bg-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-card-foreground">ADD NEW WALLPAPER</h2>
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="brutalist-border font-bold">
            <X className="h-4 w-4 mr-2" />
            CANCEL
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="file" className="text-sm font-bold text-card-foreground">
            IMAGE FILE *
          </Label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                id="file"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Label
                htmlFor="file"
                className="flex items-center justify-center w-full h-32 border-2 border-dashed brutalist-border bg-secondary hover:bg-secondary/80 cursor-pointer transition-colors"
              >
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-secondary-foreground" />
                  <p className="text-sm font-bold text-secondary-foreground">
                    {file ? file.name : 'Click to upload image'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG, WebP (Max 50MB)
                  </p>
                </div>
              </Label>
            </div>

            {preview && (
              <div className="w-32 h-32 brutalist-border bg-secondary overflow-hidden">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-bold text-card-foreground">
            TITLE *
          </Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="ENTER WALLPAPER TITLE"
            className="brutalist-border font-bold"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-bold text-card-foreground">
            DESCRIPTION
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="ENTER WALLPAPER DESCRIPTION (OPTIONAL)"
            className="brutalist-border font-bold resize-none"
            rows={3}
          />
        </div>

        {/* Slug Input */}
        <SlugInput
          title={formData.title}
          initialSlug={slug}
          onSlugChange={setSlug}
          disabled={uploading}
        />

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

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={uploading}
            className="flex-1 brutalist-border brutalist-shadow font-black"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                UPLOADING...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4 mr-2" />
                UPLOAD WALLPAPER
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}