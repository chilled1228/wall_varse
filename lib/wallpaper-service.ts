import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  increment,
  addDoc,
  serverTimestamp,
  QuerySnapshot,
  DocumentData,
  setDoc
} from 'firebase/firestore'
import { db } from './firebase'
import { slugService } from './slug-service'
import type { Wallpaper } from './seed-data'

export interface WallpaperWithId extends Wallpaper {
  id: string
  slug?: string
  slugHistory?: string[]
  customSlug?: boolean
}

export class WallpaperService {
  private static instance: WallpaperService
  private wallpapersCollection = collection(db, 'wallpapers')

  static getInstance(): WallpaperService {
    if (!WallpaperService.instance) {
      WallpaperService.instance = new WallpaperService()
    }
    return WallpaperService.instance
  }

  // Get all wallpapers
  async getAllWallpapers(): Promise<WallpaperWithId[]> {
    try {
      const q = query(this.wallpapersCollection, orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(q)
      return this.mapQuerySnapshotToWallpapers(querySnapshot)
    } catch (error) {
      console.error('Error getting all wallpapers:', error)
      throw error
    }
  }

  // Get wallpapers by category
  async getWallpapersByCategory(category: string): Promise<WallpaperWithId[]> {
    try {
      // Try the optimized query with category filter and ordering
      const q = query(
        this.wallpapersCollection,
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return this.mapQuerySnapshotToWallpapers(querySnapshot)
    } catch (error) {
      // If the composite index is not available, fall back to getting all and filtering
      if (error.code === 'failed-precondition') {
        console.warn('Composite index not available for category query, using fallback method')
        const allWallpapers = await this.getAllWallpapers()
        return allWallpapers.filter(wallpaper => wallpaper.category === category)
      }
      // For other errors, rethrow
      console.error('Error getting wallpapers by category:', error)
      throw error
    }
  }

  // Search wallpapers
  async searchWallpapers(searchTerm: string): Promise<WallpaperWithId[]> {
    try {
      // Note: Firestore doesn't have full-text search built-in
      // This is a simple implementation using array-contains for tags
      // For production, consider using Algolia or similar
      const allWallpapers = await this.getAllWallpapers()

      const searchTermLower = searchTerm.toLowerCase()
      return allWallpapers.filter(wallpaper =>
        wallpaper.title.toLowerCase().includes(searchTermLower) ||
        wallpaper.category.toLowerCase().includes(searchTermLower) ||
        wallpaper.tags.some(tag => tag.toLowerCase().includes(searchTermLower))
      )
    } catch (error) {
      console.error('Error searching wallpapers:', error)
      throw error
    }
  }

  // Get single wallpaper by ID
  async getWallpaperById(id: string): Promise<WallpaperWithId | null> {
    try {
      const docRef = doc(this.wallpapersCollection, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as WallpaperWithId
      } else {
        return null
      }
    } catch (error) {
      console.error('Error getting wallpaper by ID:', error)
      throw error
    }
  }

  // Get popular wallpapers (most downloads)
  async getPopularWallpapers(limitCount = 10): Promise<WallpaperWithId[]> {
    try {
      const q = query(
        this.wallpapersCollection,
        orderBy('downloads', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      return this.mapQuerySnapshotToWallpapers(querySnapshot)
    } catch (error) {
      console.error('Error getting popular wallpapers:', error)
      throw error
    }
  }

  // Get recent wallpapers
  async getRecentWallpapers(limitCount = 10): Promise<WallpaperWithId[]> {
    try {
      const q = query(
        this.wallpapersCollection,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const querySnapshot = await getDocs(q)
      return this.mapQuerySnapshotToWallpapers(querySnapshot)
    } catch (error) {
      console.error('Error getting recent wallpapers:', error)
      throw error
    }
  }

  // Increment download count
  async incrementDownloads(wallpaperId: string): Promise<void> {
    try {
      const docRef = doc(this.wallpapersCollection, wallpaperId)
      await updateDoc(docRef, {
        downloads: increment(1)
      })
    } catch (error) {
      console.error('Error incrementing downloads:', error)
      throw error
    }
  }

  // Increment likes count
  async incrementLikes(wallpaperId: string): Promise<void> {
    try {
      const docRef = doc(this.wallpapersCollection, wallpaperId)
      await updateDoc(docRef, {
        likes: increment(1)
      })
    } catch (error) {
      console.error('Error incrementing likes:', error)
      throw error
    }
  }

  // Decrement likes count
  async decrementLikes(wallpaperId: string): Promise<void> {
    try {
      const docRef = doc(this.wallpapersCollection, wallpaperId)
      await updateDoc(docRef, {
        likes: increment(-1)
      })
    } catch (error) {
      console.error('Error decrementing likes:', error)
      throw error
    }
  }

  // Get wallpaper by slug (NEW - for blog-style URLs)
  async getWallpaperBySlug(slug: string): Promise<WallpaperWithId | null> {
    try {
      const q = query(this.wallpapersCollection, where('slug', '==', slug))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null
      }

      const doc = querySnapshot.docs[0]
      return {
        id: doc.id,
        ...doc.data()
      } as WallpaperWithId
    } catch (error) {
      console.error('Error getting wallpaper by slug:', error)
      throw error
    }
  }

  // Create wallpaper with auto-generated slug (NEW)
  async createWallpaperWithSlug(wallpaperData: Omit<Wallpaper, 'id'>): Promise<WallpaperWithId> {
    try {
      // Generate base slug from title
      const baseSlug = slugService.generateSlug(wallpaperData.title)

      // Generate unique slug
      const uniqueSlug = await slugService.generateUniqueSlug(baseSlug)

      // Create wallpaper document with slug
      const docRef = await addDoc(this.wallpapersCollection, {
        ...wallpaperData,
        slug: uniqueSlug,
        slugHistory: [uniqueSlug],
        customSlug: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Return the created wallpaper
      return {
        id: docRef.id,
        ...wallpaperData,
        slug: uniqueSlug,
        slugHistory: [uniqueSlug],
        customSlug: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    } catch (error) {
      console.error('Error creating wallpaper with slug:', error)
      throw error
    }
  }

  // Update wallpaper slug (for admin custom slugs)
  async updateWallpaperSlug(wallpaperId: string, newSlug: string): Promise<void> {
    try {
      const docRef = doc(this.wallpapersCollection, wallpaperId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('Wallpaper not found')
      }

      const currentData = docSnap.data()
      const currentSlug = currentData.slug || ''
      const slugHistory = currentData.slugHistory || []

      // Only update if slug is different
      if (currentSlug !== newSlug) {
        await updateDoc(docRef, {
          slug: newSlug,
          slugHistory: [...slugHistory, newSlug].filter(Boolean),
          customSlug: true,
          updatedAt: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error updating wallpaper slug:', error)
      throw error
    }
  }

  // Add missing slugs to existing wallpapers (migration helper)
  async addMissingSlugs(): Promise<{ updated: number; errors: string[] }> {
    try {
      const wallpapers = await this.getAllWallpapers()
      const errors: string[] = []
      let updated = 0

      for (const wallpaper of wallpapers) {
        if (!wallpaper.slug) {
          try {
            const baseSlug = slugService.generateSlug(wallpaper.title)
            const uniqueSlug = await slugService.generateUniqueSlug(baseSlug, wallpaper.id)

            const docRef = doc(this.wallpapersCollection, wallpaper.id)
            await updateDoc(docRef, {
              slug: uniqueSlug,
              slugHistory: [uniqueSlug],
              customSlug: false,
              updatedAt: serverTimestamp()
            })

            updated++
          } catch (error) {
            console.error(`Error adding slug to wallpaper ${wallpaper.id}:`, error)
            errors.push(`Failed to add slug to ${wallpaper.title}`)
          }
        }
      }

      return { updated, errors }
    } catch (error) {
      console.error('Error in addMissingSlugs:', error)
      return { updated: 0, errors: ['Migration failed'] }
    }
  }

  // Get wallpaper by identifier (supports both ID and slug for flexibility)
  async getWallpaperByIdentifier(identifier: string): Promise<WallpaperWithId | null> {
    try {
      // First try to get by slug (new system)
      const bySlug = await this.getWallpaperBySlug(identifier)
      if (bySlug) {
        return bySlug
      }

      // Fallback to ID lookup (legacy system)
      const byId = await this.getWallpaperById(identifier)
      if (byId) {
        return byId
      }

      // Try legacy numeric patterns (e.g., "wallpaper-1")
      if (identifier.startsWith('wallpaper-')) {
        const legacyId = identifier.replace('wallpaper-', '')
        return await this.getWallpaperById(legacyId)
      }

      return null
    } catch (error) {
      console.error('Error getting wallpaper by identifier:', error)
      throw error
    }
  }

  // Helper method to map Firestore query snapshot to wallpaper objects
  private mapQuerySnapshotToWallpapers(querySnapshot: QuerySnapshot<DocumentData>): WallpaperWithId[] {
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as WallpaperWithId[]
  }
}

// Export singleton instance
export const wallpaperService = WallpaperService.getInstance()