"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Check, X, AlertCircle, Lightbulb } from "lucide-react"
import { slugService } from "@/lib/slug-service"

interface SlugInputProps {
  title: string
  initialSlug?: string
  onSlugChange: (slug: string) => void
  disabled?: boolean
}

export function SlugInput({ title, initialSlug, onSlugChange, disabled = false }: SlugInputProps) {
  const [slug, setSlug] = useState(initialSlug || "")
  const [isCustom, setIsCustom] = useState(!!initialSlug)
  const [isValidating, setIsValidating] = useState(false)
  const [validation, setValidation] = useState<any>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // Generate slug from title when title changes
  useEffect(() => {
    if (!isCustom && title && !disabled) {
      const newSlug = slugService.generateSlug(title)
      setSlug(newSlug)
      onSlugChange(newSlug)
      validateSlug(newSlug)
    }
  }, [title, isCustom, disabled, onSlugChange])

  // Generate suggestions
  useEffect(() => {
    if (title) {
      const newSuggestions = slugService.generateSlugSuggestions(title)
      setSuggestions(newSuggestions)
    }
  }, [title])

  const validateSlug = async (slugToValidate: string) => {
    if (!slugToValidate) return

    setIsValidating(true)
    try {
      const result = slugService.validateSlug(slugToValidate)
      setValidation(result)
    } catch (error) {
      console.error('Error validating slug:', error)
    } finally {
      setIsValidating(false)
    }
  }

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug)
    setIsCustom(true)
    onSlugChange(newSlug)
    validateSlug(newSlug)
  }

  const useSuggestion = (suggestion: string) => {
    setSlug(suggestion)
    setIsCustom(true)
    onSlugChange(suggestion)
    validateSlug(suggestion)
  }

  const regenerateSlug = () => {
    const newSlug = slugService.generateSlug(title)
    setSlug(newSlug)
    setIsCustom(false)
    onSlugChange(newSlug)
    validateSlug(newSlug)
  }

  const getValidationColor = () => {
    if (!validation) return "text-gray-500"
    if (validation.isValid) return "text-green-600"
    return "text-red-600"
  }

  const getValidationIcon = () => {
    if (isValidating) return <RefreshCw className="h-4 w-4 animate-spin" />
    if (!validation) return null
    if (validation.isValid) return <Check className="h-4 w-4 text-green-600" />
    return <X className="h-4 w-4 text-red-600" />
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="slug" className="font-bold">
          URL SLUG
        </Label>
        <div className="flex items-center gap-2">
          {getValidationIcon()}
          <span className={`text-sm ${getValidationColor()}`}>
            {isValidating ? "VALIDATING..." : validation?.isValid ? "VALID" : "INVALID"}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              /wallpaper-page/
            </div>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              onBlur={() => validateSlug(slug)}
              placeholder="your-wallpaper-slug"
              className="pl-20 brutalalist-border font-bold"
              disabled={disabled}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={regenerateSlug}
          disabled={disabled || !title}
          className="brutalist-border bg-transparent"
          title="Regenerate from title"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* URL Preview */}
      <div className="text-sm">
        <span className="font-bold text-muted-foreground">PREVIEW:</span>
        <span className="ml-2 font-mono text-blue-600">
          /wallpaper-page/{slug}
        </span>
      </div>

      {/* Validation Errors */}
      {validation?.errors && validation.errors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <span className="text-sm font-bold text-red-800">ISSUES FOUND:</span>
                {validation.errors.map((error: string, index: number) => (
                  <div key={index} className="text-sm text-red-700">
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SEO Suggestions */}
      {validation?.suggestions && validation.suggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <span className="text-sm font-bold text-blue-800">SEO SUGGESTIONS:</span>
                {validation.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => useSuggestion(suggestion)}
                      className="h-6 px-2 text-xs brutalalist-border bg-transparent text-blue-700 hover:bg-blue-100"
                    >
                      USE
                    </Button>
                    <span className="text-sm text-blue-700 font-mono">
                      {suggestion}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auto-generated slug suggestions */}
      {!isCustom && suggestions.length > 1 && (
        <div className="space-y-2">
          <span className="text-sm font-bold text-muted-foreground">ALTERNATIVE SUGGESTIONS:</span>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(1, 4).map((suggestion, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer brutalalist-border hover:bg-accent"
                onClick={() => useSuggestion(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Custom slug indicator */}
      {isCustom && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="brutalist-border text-orange-600 border-orange-300">
            CUSTOM SLUG
          </Badge>
          <span className="text-xs text-muted-foreground">
            This slug has been manually customized
          </span>
        </div>
      )}
    </div>
  )
}