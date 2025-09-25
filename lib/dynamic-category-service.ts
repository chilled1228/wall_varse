import { wallpaperService } from './wallpaper-service'
import { CATEGORIES } from './slug-utils'
import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

export interface DynamicCategory {
  slug: string
  name: string
  description: string
  seoTitle: string
  count: number
  featured: boolean
  isPredefined: boolean
}

export interface CategoryStats {
  totalCategories: number
  predefinedCategories: number
  dynamicCategories: number
  totalWallpapers: number
}

/**
 * Generate category metadata for dynamic categories
 */
function generateCategoryMetadata(categorySlug: string, count: number): DynamicCategory {
  // Check if it's a predefined category
  const predefined = Object.values(CATEGORIES).find(cat => cat.slug === categorySlug)

  if (predefined) {
    return {
      slug: predefined.slug,
      name: predefined.name,
      description: predefined.description,
      seoTitle: predefined.seoTitle,
      count,
      featured: ['nature', 'abstract', 'minimal', 'dark'].includes(categorySlug),
      isPredefined: true
    }
  }

  // Generate metadata for dynamic categories
  const name = categorySlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  return {
    slug: categorySlug,
    name,
    description: `Beautiful ${name.toLowerCase()} wallpapers with high-quality designs and vibrant colors`,
    seoTitle: `${name} Wallpapers - Free Mobile & Desktop Backgrounds`,
    count,
    featured: false,
    isPredefined: false
  }
}

/**
 * Get all categories from wallpapers in the database
 */
export async function getAllDynamicCategories(): Promise<DynamicCategory[]> {
  try {
    // Try using wallpaperService first
    try {
      const wallpapers = await wallpaperService.getAllWallpapers()

      // Count wallpapers by category
      const categorycounts: { [key: string]: number } = {}

      wallpapers.forEach(wallpaper => {
        const category = wallpaper.category
        categorycounts[category] = (categorycounts[category] || 0) + 1
      })

      // Generate category metadata for all categories
      const categories: DynamicCategory[] = Object.entries(categorycounts).map(
        ([slug, count]) => generateCategoryMetadata(slug, count)
      )

      // Sort by count (descending) and then by name
      return categories.sort((a, b) => {
        if (a.count !== b.count) {
          return b.count - a.count
        }
        return a.name.localeCompare(b.name)
      })
    } catch (serviceError) {
      console.log('Wallpaper service failed, trying direct Firestore query:', serviceError)

      // Fallback to direct Firestore query
      const wallpapersRef = collection(db, 'wallpapers')
      const querySnapshot = await getDocs(wallpapersRef)

      // Count wallpapers by category
      const categorycounts: { [key: string]: number } = {}

      querySnapshot.forEach(doc => {
        const data = doc.data()
        if (data.category) {
          categorycounts[data.category] = (categorycounts[data.category] || 0) + 1
        }
      })

      // Generate category metadata for all categories
      const categories: DynamicCategory[] = Object.entries(categorycounts).map(
        ([slug, count]) => generateCategoryMetadata(slug, count)
      )

      // Sort by count (descending) and then by name
      return categories.sort((a, b) => {
        if (a.count !== b.count) {
          return b.count - a.count
        }
        return a.name.localeCompare(b.name)
      })
    }
  } catch (error) {
    console.error('Error getting dynamic categories:', error)
    return []
  }
}

/**
 * Get a specific category by slug (predefined or dynamic)
 */
export async function getCategoryBySlug(slug: string): Promise<DynamicCategory | null> {
  try {
    const allCategories = await getAllDynamicCategories()
    return allCategories.find(cat => cat.slug === slug) || null
  } catch (error) {
    console.error('Error getting category by slug:', error)
    return null
  }
}

/**
 * Get featured categories
 */
export async function getFeaturedCategories(): Promise<DynamicCategory[]> {
  try {
    const allCategories = await getAllDynamicCategories()
    return allCategories.filter(cat => cat.featured)
  } catch (error) {
    console.error('Error getting featured categories:', error)
    return []
  }
}

/**
 * Get category statistics
 */
export async function getCategoryStats(): Promise<CategoryStats> {
  try {
    const allCategories = await getAllDynamicCategories()
    const predefinedCount = allCategories.filter(cat => cat.isPredefined).length
    const dynamicCount = allCategories.filter(cat => !cat.isPredefined).length
    const totalWallpapers = allCategories.reduce((sum, cat) => sum + cat.count, 0)

    return {
      totalCategories: allCategories.length,
      predefinedCategories: predefinedCount,
      dynamicCategories: dynamicCount,
      totalWallpapers
    }
  } catch (error) {
    console.error('Error getting category stats:', error)
    return {
      totalCategories: 0,
      predefinedCategories: 0,
      dynamicCategories: 0,
      totalWallpapers: 0
    }
  }
}

/**
 * Get all unique resolutions from wallpapers
 */
export async function getAllResolutions(): Promise<string[]> {
  try {
    // Try wallpaperService first
    try {
      const wallpapers = await wallpaperService.getAllWallpapers()
      const resolutions = new Set<string>()

      wallpapers.forEach(wallpaper => {
        if (wallpaper.resolution) {
          resolutions.add(wallpaper.resolution)
        }
      })

      return Array.from(resolutions).sort((a, b) => {
        // Sort by resolution area (width * height)
        const [aWidth, aHeight] = a.split('x').map(Number)
        const [bWidth, bHeight] = b.split('x').map(Number)
        const aArea = aWidth * aHeight
        const bArea = bWidth * bHeight
        return bArea - aArea // Descending order
      })
    } catch (serviceError) {
      console.log('Wallpaper service failed for resolutions, trying direct Firestore query:', serviceError)

      // Fallback to direct Firestore query
      const wallpapersRef = collection(db, 'wallpapers')
      const querySnapshot = await getDocs(wallpapersRef)
      const resolutions = new Set<string>()

      querySnapshot.forEach(doc => {
        const data = doc.data()
        if (data.resolution) {
          resolutions.add(data.resolution)
        }
      })

      return Array.from(resolutions).sort((a, b) => {
        // Sort by resolution area (width * height)
        const [aWidth, aHeight] = a.split('x').map(Number)
        const [bWidth, bHeight] = b.split('x').map(Number)
        const aArea = aWidth * aHeight
        const bArea = bWidth * bHeight
        return bArea - aArea // Descending order
      })
    }
  } catch (error) {
    console.error('Error getting resolutions:', error)
    return ['1080x1920', '1440x2560', '2160x3840'] // Fallback defaults
  }
}

/**
 * Get all unique device types from wallpapers
 */
export async function getAllDeviceTypes(): Promise<string[]> {
  try {
    // Try wallpaperService first
    try {
      const wallpapers = await wallpaperService.getAllWallpapers()
      const deviceTypes = new Set<string>()

      wallpapers.forEach(wallpaper => {
        if (wallpaper.deviceType) {
          deviceTypes.add(wallpaper.deviceType)
        }
      })

      return Array.from(deviceTypes).sort()
    } catch (serviceError) {
      console.log('Wallpaper service failed for device types, trying direct Firestore query:', serviceError)

      // Fallback to direct Firestore query
      const wallpapersRef = collection(db, 'wallpapers')
      const querySnapshot = await getDocs(wallpapersRef)
      const deviceTypes = new Set<string>()

      querySnapshot.forEach(doc => {
        const data = doc.data()
        if (data.deviceType) {
          deviceTypes.add(data.deviceType)
        }
      })

      return Array.from(deviceTypes).sort()
    }
  } catch (error) {
    console.error('Error getting device types:', error)
    return ['phone', 'tablet', 'desktop'] // Fallback defaults
  }
}