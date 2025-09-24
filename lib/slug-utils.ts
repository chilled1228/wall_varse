/**
 * Slug utility functions for SEO-friendly URLs and category management
 */

// Category configuration with proper slugs and metadata
export const CATEGORIES = {
  abstract: {
    slug: 'abstract',
    name: 'Abstract',
    description: 'Abstract and artistic wallpapers with unique patterns and designs',
    seoTitle: 'Abstract Wallpapers - Artistic & Creative Backgrounds',
  },
  nature: {
    slug: 'nature',
    name: 'Nature',
    description: 'Beautiful nature wallpapers featuring landscapes, mountains, and outdoor scenes',
    seoTitle: 'Nature Wallpapers - Landscape & Outdoor Backgrounds',
  },
  minimal: {
    slug: 'minimal',
    name: 'Minimal',
    description: 'Clean and minimalist wallpapers with simple, elegant designs',
    seoTitle: 'Minimal Wallpapers - Clean & Simple Backgrounds',
  },
  space: {
    slug: 'space',
    name: 'Space',
    description: 'Space and astronomy wallpapers featuring galaxies, nebulae, and cosmic scenes',
    seoTitle: 'Space Wallpapers - Galaxy & Astronomy Backgrounds',
  },
  dark: {
    slug: 'dark',
    name: 'Dark',
    description: 'Dark themed wallpapers perfect for OLED displays and night viewing',
    seoTitle: 'Dark Wallpapers - OLED & Night Mode Backgrounds',
  },
  colorful: {
    slug: 'colorful',
    name: 'Colorful',
    description: 'Vibrant and colorful wallpapers with bright, eye-catching designs',
    seoTitle: 'Colorful Wallpapers - Vibrant & Bright Backgrounds',
  },
  animals: {
    slug: 'animals',
    name: 'Animals',
    description: 'Wildlife and animal wallpapers featuring pets, wild animals, and creatures',
    seoTitle: 'Animal Wallpapers - Wildlife & Pet Backgrounds',
  },
  cars: {
    slug: 'cars',
    name: 'Cars',
    description: 'Automotive wallpapers featuring sports cars, supercars, and vehicles',
    seoTitle: 'Car Wallpapers - Automotive & Vehicle Backgrounds',
  },
  architecture: {
    slug: 'architecture',
    name: 'Architecture',
    description: 'Architectural wallpapers featuring buildings, structures, and urban designs',
    seoTitle: 'Architecture Wallpapers - Building & Urban Backgrounds',
  },
} as const

export type CategoryKey = keyof typeof CATEGORIES
export type CategorySlug = typeof CATEGORIES[CategoryKey]['slug']

/**
 * Generate a URL-safe slug from a string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    // Remove special characters except hyphens and alphanumeric
    .replace(/[^\w\s-]/g, '')
    // Replace spaces and multiple hyphens with single hyphen
    .replace(/[-\s]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '')
}

/**
 * Generate a unique wallpaper slug from title and ID
 */
export function generateWallpaperSlug(title: string, id: string): string {
  const baseSlug = generateSlug(title)
  const shortId = id.slice(-6) // Last 6 characters of ID for uniqueness
  return `${baseSlug}-${shortId}`
}

/**
 * Extract ID from wallpaper slug
 */
export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-')
  const lastPart = parts[parts.length - 1]

  // Check if last part looks like an ID (6 characters, alphanumeric)
  if (lastPart && lastPart.length === 6 && /^[a-zA-Z0-9]+$/.test(lastPart)) {
    return lastPart
  }

  return null
}

/**
 * Get category data by slug
 */
export function getCategoryBySlug(slug: string): typeof CATEGORIES[CategoryKey] | null {
  const category = Object.values(CATEGORIES).find(cat => cat.slug === slug)
  return category || null
}

/**
 * Get category key by slug
 */
export function getCategoryKeyBySlug(slug: string): CategoryKey | null {
  const entries = Object.entries(CATEGORIES) as [CategoryKey, typeof CATEGORIES[CategoryKey]][]
  const entry = entries.find(([, cat]) => cat.slug === slug)
  return entry ? entry[0] : null
}

/**
 * Get all categories as array
 */
export function getAllCategories() {
  return Object.entries(CATEGORIES).map(([key, category]) => ({
    key: key as CategoryKey,
    ...category,
  }))
}

/**
 * Validate category slug
 */
export function isValidCategorySlug(slug: string): slug is CategorySlug {
  return Object.values(CATEGORIES).some(cat => cat.slug === slug)
}

/**
 * Generate SEO-friendly URL for wallpaper
 */
export function generateWallpaperUrl(title: string, id: string, category?: CategoryKey): string {
  const wallpaperSlug = generateWallpaperSlug(title, id)

  if (category && CATEGORIES[category]) {
    const categorySlug = CATEGORIES[category].slug
    return `/category/${categorySlug}/wallpaper/${wallpaperSlug}`
  }

  return `/wallpaper/${wallpaperSlug}`
}

/**
 * Generate category URL
 */
export function generateCategoryUrl(categoryKey: CategoryKey): string {
  return `/category/${CATEGORIES[categoryKey].slug}`
}

/**
 * Parse wallpaper URL to extract category and wallpaper info
 */
export function parseWallpaperUrl(pathname: string): {
  categorySlug?: string
  wallpaperSlug?: string
  wallpaperId?: string
} | null {
  // Match patterns: /wallpaper/slug or /category/cat-slug/wallpaper/slug
  const patterns = [
    /^\/wallpaper\/([^\/]+)$/,
    /^\/category\/([^\/]+)\/wallpaper\/([^\/]+)$/,
  ]

  for (const pattern of patterns) {
    const match = pathname.match(pattern)
    if (match) {
      if (pattern.source.includes('category')) {
        // Category + wallpaper pattern
        const [, categorySlug, wallpaperSlug] = match
        const wallpaperId = extractIdFromSlug(wallpaperSlug)
        return { categorySlug, wallpaperSlug, wallpaperId: wallpaperId || undefined }
      } else {
        // Direct wallpaper pattern
        const [, wallpaperSlug] = match
        const wallpaperId = extractIdFromSlug(wallpaperSlug)
        return { wallpaperSlug, wallpaperId: wallpaperId || undefined }
      }
    }
  }

  return null
}

/**
 * Generate breadcrumb data for SEO
 */
export function generateBreadcrumbs(categoryKey?: CategoryKey, wallpaperTitle?: string) {
  const breadcrumbs = [
    { name: 'Home', url: '/' }
  ]

  if (categoryKey && CATEGORIES[categoryKey]) {
    const category = CATEGORIES[categoryKey]
    breadcrumbs.push({
      name: category.name,
      url: generateCategoryUrl(categoryKey)
    })
  }

  if (wallpaperTitle) {
    breadcrumbs.push({
      name: wallpaperTitle,
      url: '#' // Current page
    })
  }

  return breadcrumbs
}