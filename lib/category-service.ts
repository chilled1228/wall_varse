import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore'
import { db } from './firebase'

export interface Category {
  slug: string
  name: string
  description: string
  count: number
  featured: boolean
  createdAt?: Date
}

export interface CategoryWithId extends Category {
  id: string
}

export class CategoryService {
  private static instance: CategoryService
  private categoriesCollection = collection(db, 'categories')

  // Predefined categories that come with the system
  private predefinedCategories: Category[] = [
    {
      slug: "nature",
      name: "NATURE",
      description: "Beautiful landscapes, forests, mountains, and natural scenes",
      count: 0,
      featured: true,
    },
    {
      slug: "abstract",
      name: "ABSTRACT",
      description: "Artistic patterns, geometric shapes, and creative designs",
      count: 0,
      featured: true,
    },
    {
      slug: "minimal",
      name: "MINIMAL",
      description: "Clean, simple designs with plenty of white space",
      count: 0,
      featured: true,
    },
    {
      slug: "dark",
      name: "DARK",
      description: "Dark themes perfect for OLED displays and night mode",
      count: 0,
      featured: true,
    },
    {
      slug: "colorful",
      name: "COLORFUL",
      description: "Vibrant, bright wallpapers full of color",
      count: 0,
      featured: false,
    },
    {
      slug: "space",
      name: "SPACE",
      description: "Galaxies, planets, stars, and cosmic phenomena",
      count: 0,
      featured: false,
    },
    {
      slug: "animals",
      name: "ANIMALS",
      description: "Wildlife, pets, and animal photography",
      count: 0,
      featured: false,
    },
    {
      slug: "cars",
      name: "CARS",
      description: "Sports cars, vintage automobiles, and automotive art",
      count: 0,
      featured: false,
    },
    {
      slug: "architecture",
      name: "ARCHITECTURE",
      description: "Buildings, structures, and architectural photography",
      count: 0,
      featured: false,
    },
  ]

  static getInstance(): CategoryService {
    if (!CategoryService.instance) {
      CategoryService.instance = new CategoryService()
    }
    return CategoryService.instance
  }

  // Get all categories (both predefined and custom)
  async getAllCategories(): Promise<CategoryWithId[]> {
    try {
      const querySnapshot = await getDocs(this.categoriesCollection)
      const customCategories: CategoryWithId[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CategoryWithId[]

      // Merge predefined categories with custom ones
      const allCategories = [...this.predefinedCategories, ...customCategories]

      // Remove duplicates (custom categories override predefined ones)
      const uniqueCategories = allCategories.reduce((acc, category) => {
        const existing = acc.find(c => c.slug === category.slug)
        if (!existing) {
          acc.push({
            ...category,
            id: category.slug // Use slug as ID for consistency
          })
        }
        return acc
      }, [] as CategoryWithId[])

      return uniqueCategories.sort((a, b) => a.name.localeCompare(b.name))
    } catch (error) {
      console.error('Error getting all categories:', error)
      // Return predefined categories as fallback
      return this.predefinedCategories.map(cat => ({
        ...cat,
        id: cat.slug
      }))
    }
  }

  // Get featured categories
  async getFeaturedCategories(): Promise<CategoryWithId[]> {
    try {
      const allCategories = await this.getAllCategories()
      return allCategories.filter(category => category.featured)
    } catch (error) {
      console.error('Error getting featured categories:', error)
      return []
    }
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<CategoryWithId | null> {
    try {
      // Check if it's a predefined category
      const predefined = this.predefinedCategories.find(cat => cat.slug === slug)
      if (predefined) {
        return {
          ...predefined,
          id: predefined.slug
        }
      }

      // Check custom categories in database
      const docRef = doc(this.categoriesCollection, slug)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as CategoryWithId
      }

      return null
    } catch (error) {
      console.error('Error getting category by slug:', error)
      return null
    }
  }

  // Create a new category
  async createCategory(categoryData: Omit<Category, 'createdAt'>): Promise<CategoryWithId> {
    try {
      const slug = categoryData.slug.toLowerCase().trim()

      // Check if category already exists
      const existing = await this.getCategoryBySlug(slug)
      if (existing) {
        throw new Error('Category already exists')
      }

      const newCategory = {
        ...categoryData,
        slug: slug,
        name: categoryData.name.toUpperCase(),
        createdAt: serverTimestamp()
      }

      const docRef = doc(this.categoriesCollection, slug)
      await setDoc(docRef, newCategory)

      return {
        id: slug,
        ...newCategory,
        createdAt: new Date()
      }
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }

  // Update category count when wallpapers are added/removed
  async updateCategoryCount(slug: string, incrementValue: number): Promise<void> {
    try {
      // Only update counts for custom categories in database
      const isPredefined = this.predefinedCategories.some(cat => cat.slug === slug)
      if (isPredefined) {
        return // Don't update predefined categories in database
      }

      const docRef = doc(this.categoriesCollection, slug)
      await updateDoc(docRef, {
        count: increment(incrementValue)
      })
    } catch (error) {
      console.error('Error updating category count:', error)
      // Don't throw error as this is not critical
    }
  }

  // Check if category exists
  async categoryExists(slug: string): Promise<boolean> {
    try {
      const category = await this.getCategoryBySlug(slug)
      return category !== null
    } catch (error) {
      console.error('Error checking if category exists:', error)
      return false
    }
  }

  // Auto-create category if it doesn't exist
  async ensureCategoryExists(slug: string, name?: string): Promise<CategoryWithId> {
    try {
      const existing = await this.getCategoryBySlug(slug)
      if (existing) {
        return existing
      }

      // Create new category with default values
      const categoryName = name || slug.charAt(0).toUpperCase() + slug.slice(1)
      const newCategory = await this.createCategory({
        slug: slug,
        name: categoryName.toUpperCase(),
        description: `${categoryName} wallpapers`,
        count: 0,
        featured: false
      })

      return newCategory
    } catch (error) {
      console.error('Error ensuring category exists:', error)
      throw error
    }
  }

  // Get categories with wallpaper counts
  async getCategoriesWithCounts(): Promise<CategoryWithId[]> {
    try {
      // This would typically involve joining with wallpapers collection
      // For now, return categories as-is
      return await this.getAllCategories()
    } catch (error) {
      console.error('Error getting categories with counts:', error)
      return []
    }
  }
}

// Export singleton instance
export const categoryService = CategoryService.getInstance()