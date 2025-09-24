"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { adminService, type AdminUser } from '@/lib/admin-service'

interface AdminContextType {
  user: User | null
  adminUser: AdminUser | null
  isAdmin: boolean
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  refreshAdminStatus: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = adminService.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser)

      if (firebaseUser) {
        try {
          const adminUserData = await adminService.getAdminUser(firebaseUser.uid)
          setAdminUser(adminUserData)
        } catch (error) {
          console.error('Error fetching admin user data:', error)
          setAdminUser(null)
        }
      } else {
        setAdminUser(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const adminUserData = await adminService.signInWithGoogle()
      setAdminUser(adminUserData)
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      await adminService.signOut()
      setUser(null)
      setAdminUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshAdminStatus = async () => {
    if (user) {
      try {
        const adminUserData = await adminService.getAdminUser(user.uid)
        setAdminUser(adminUserData)
      } catch (error) {
        console.error('Error refreshing admin status:', error)
      }
    }
  }

  const value = {
    user,
    adminUser,
    isAdmin: adminUser?.isAdmin || false,
    loading,
    signInWithGoogle,
    signOut,
    refreshAdminStatus
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
}