import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { auth, googleProvider, db } from './firebase'

export interface AdminUser {
  uid: string
  email: string
  displayName: string | null
  photoURL: string | null
  isAdmin: boolean
  createdAt: Date
  lastLogin: Date
}

export class AdminService {
  private static instance: AdminService
  private adminUsersCollection = collection(db, 'admin_users')

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AdminUser | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user

      if (!user.email) {
        throw new Error('No email found in Google account')
      }

      // Check if user exists in admin_users collection
      const adminUser = await this.getAdminUser(user.uid)

      if (adminUser) {
        // Update last login
        await this.updateLastLogin(user.uid)
        return { ...adminUser, lastLogin: new Date() }
      } else {
        // Create new admin user (not admin by default)
        const newAdminUser: AdminUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          isAdmin: false, // Default to false, needs to be manually set
          createdAt: new Date(),
          lastLogin: new Date()
        }

        await this.createAdminUser(newAdminUser)
        return newAdminUser
      }
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  // Get admin user by UID
  async getAdminUser(uid: string): Promise<AdminUser | null> {
    try {
      const docRef = doc(this.adminUsersCollection, uid)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          uid: docSnap.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          isAdmin: data.isAdmin,
          createdAt: data.createdAt.toDate(),
          lastLogin: data.lastLogin.toDate()
        }
      }
      return null
    } catch (error) {
      console.error('Error getting admin user:', error)
      throw error
    }
  }

  // Create new admin user
  async createAdminUser(adminUser: AdminUser): Promise<void> {
    try {
      const docRef = doc(this.adminUsersCollection, adminUser.uid)
      await setDoc(docRef, {
        email: adminUser.email,
        displayName: adminUser.displayName,
        photoURL: adminUser.photoURL,
        isAdmin: adminUser.isAdmin,
        createdAt: adminUser.createdAt,
        lastLogin: adminUser.lastLogin
      })
    } catch (error) {
      console.error('Error creating admin user:', error)
      throw error
    }
  }

  // Update last login
  async updateLastLogin(uid: string): Promise<void> {
    try {
      const docRef = doc(this.adminUsersCollection, uid)
      await updateDoc(docRef, {
        lastLogin: new Date()
      })
    } catch (error) {
      console.error('Error updating last login:', error)
      throw error
    }
  }

  // Make user admin
  async makeUserAdmin(uid: string): Promise<void> {
    try {
      const docRef = doc(this.adminUsersCollection, uid)
      await updateDoc(docRef, {
        isAdmin: true
      })
    } catch (error) {
      console.error('Error making user admin:', error)
      throw error
    }
  }

  // Remove admin rights
  async removeAdminRights(uid: string): Promise<void> {
    try {
      const docRef = doc(this.adminUsersCollection, uid)
      await updateDoc(docRef, {
        isAdmin: false
      })
    } catch (error) {
      console.error('Error removing admin rights:', error)
      throw error
    }
  }

  // Get all admin users
  async getAllAdminUsers(): Promise<AdminUser[]> {
    try {
      const querySnapshot = await getDocs(this.adminUsersCollection)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          isAdmin: data.isAdmin,
          createdAt: data.createdAt.toDate(),
          lastLogin: data.lastLogin.toDate()
        }
      })
    } catch (error) {
      console.error('Error getting all admin users:', error)
      throw error
    }
  }

  // Get only admin users
  async getAdmins(): Promise<AdminUser[]> {
    try {
      const q = query(this.adminUsersCollection, where('isAdmin', '==', true))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          uid: doc.id,
          email: data.email,
          displayName: data.displayName,
          photoURL: data.photoURL,
          isAdmin: data.isAdmin,
          createdAt: data.createdAt.toDate(),
          lastLogin: data.lastLogin.toDate()
        }
      })
    } catch (error) {
      console.error('Error getting admins:', error)
      throw error
    }
  }

  // Auth state observer
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  }

  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const currentUser = auth.currentUser
      if (!currentUser) return false

      const adminUser = await this.getAdminUser(currentUser.uid)
      return adminUser?.isAdmin || false
    } catch (error) {
      console.error('Error checking if user is admin:', error)
      return false
    }
  }
}

// Export singleton instance
export const adminService = AdminService.getInstance()