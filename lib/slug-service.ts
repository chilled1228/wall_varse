import { wallpaperService } from './wallpaper-service'

interface SlugOptions {
  maxLength?: number
  separator?: string
  lowercase?: boolean
  preserveCase?: boolean
  removeStopWords?: boolean
}

interface SlugValidationResult {
  isValid: boolean
  slug: string
  errors: string[]
  suggestions?: string[]
}

// Common stop words to remove for better SEO
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
])

// Characters that need to be replaced or removed
const UNSAFE_CHARS = /[^\w\s-]/g
const MULTIPLE_SPACES = /[\s-]+/g
const LEADING_TRAILING_SPACES = /^-+|-+$/g

export class SlugService {
  private static instance: SlugService

  static getInstance(): SlugService {
    if (!SlugService.instance) {
      SlugService.instance = new SlugService()
    }
    return SlugService.instance
  }

  /**
   * Generate a SEO-friendly slug from text
   */
  generateSlug(text: string, options: SlugOptions = {}): string {
    const {
      maxLength = 60,
      separator = '-',
      lowercase = true,
      removeStopWords = true
    } = options

    // Convert to lowercase if requested
    let slug = lowercase ? text.toLowerCase() : text

    // Remove stop words for better SEO
    if (removeStopWords) {
      const words = slug.split(' ')
      slug = words.filter(word => !STOP_WORDS.has(word)).join(' ')
    }

    // Remove unsafe characters
    slug = slug.replace(UNSAFE_CHARS, '')

    // Replace spaces and multiple separators with single separator
    slug = slug.replace(MULTIPLE_SPACES, separator)

    // Remove leading and trailing separators
    slug = slug.replace(LEADING_TRAILING_SPACES, '')

    // Trim to max length
    if (slug.length > maxLength) {
      slug = slug.substring(0, maxLength).replace(/-+$/, '')
    }

    return slug || 'untitled'
  }

  /**
   * Generate unique slug by checking against existing wallpapers
   */
  async generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    // Check if slug exists and make unique
    while (await this.slugExists(slug, excludeId)) {
      slug = `${baseSlug}-${counter}`
      counter++

      // Prevent infinite loop
      if (counter > 100) {
        throw new Error('Could not generate unique slug')
      }
    }

    return slug
  }

  /**
   * Check if slug already exists in database
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    try {
      const wallpapers = await wallpaperService.getAllWallpapers()
      return wallpapers.some(wallpaper =>
        wallpaper.slug === slug && wallpaper.id !== excludeId
      )
    } catch (error) {
      console.error('Error checking slug existence:', error)
      return false
    }
  }

  /**
   * Validate a slug according to SEO best practices
   */
  validateSlug(slug: string): SlugValidationResult {
    const errors: string[] = []
    const suggestions: string[] = []

    // Check length
    if (slug.length < 3) {
      errors.push('Slug must be at least 3 characters long')
    }
    if (slug.length > 100) {
      errors.push('Slug should not exceed 100 characters')
    }

    // Check for invalid characters
    if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens')
    }

    // Check for consecutive hyphens
    if (/--/.test(slug)) {
      errors.push('Slug should not contain consecutive hyphens')
    }

    // Check for leading/trailing hyphens
    if (/^-/.test(slug) || /-$/.test(slug)) {
      errors.push('Slug should not start or end with hyphens')
    }

    // Check for common patterns that might need improvement
    if (slug.includes('wallpaper')) {
      suggestions.push('Consider removing "wallpaper" from slug for conciseness')
    }

    if (slug.split('-').length > 6) {
      suggestions.push('Consider shortening slug for better readability')
    }

    return {
      isValid: errors.length === 0,
      slug,
      errors,
      suggestions: suggestions.length > 0 ? suggestions : undefined
    }
  }

  /**
   * Generate slug suggestions for a given title
   */
  generateSlugSuggestions(title: string): string[] {
    const suggestions: string[] = []

    // Primary suggestion (with stop words removed)
    suggestions.push(this.generateSlug(title, {
      removeStopWords: true,
      maxLength: 50
    }))

    // Shorter version
    suggestions.push(this.generateSlug(title, {
      removeStopWords: true,
      maxLength: 30
    }))

    // Without stop words removal
    suggestions.push(this.generateSlug(title, {
      removeStopWords: false,
      maxLength: 50
    }))

    // Very short version for social media
    suggestions.push(this.generateSlug(title, {
      removeStopWords: true,
      maxLength: 25
    }))

    // Remove duplicates and return
    return [...new Set(suggestions)].filter(Boolean).slice(0, 5)
  }

  /**
   * Extract keywords from slug for SEO analysis
   */
  extractKeywords(slug: string): string[] {
    return slug
      .split('-')
      .filter(word => word.length > 2)
      .filter(word => !STOP_WORDS.has(word))
  }

  /**
   * Generate canonical URL for wallpaper
   */
  generateCanonicalUrl(slug: string, category?: string): string {
    if (category) {
      return `/category/${category}/wallpaper/${slug}`
    }
    return `/wallpaper/${slug}`
  }

  /**
   * Clean and normalize user-provided slug
   */
  cleanUserSlug(userSlug: string): string {
    return this.generateSlug(userSlug, {
      removeStopWords: false, // Preserve user intent
      maxLength: 100
    })
  }
}

// Export singleton instance
export const slugService = SlugService.getInstance()