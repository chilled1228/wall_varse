"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"

interface AdminRouteGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function AdminRouteGuard({ children, requireAdmin = true }: AdminRouteGuardProps) {
  const router = useRouter()
  const { user, adminUser, isAdmin, loading } = useAdmin()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to admin login
        router.push('/admin')
        return
      }

      if (requireAdmin && !isAdmin) {
        // Logged in but not admin, redirect to admin login (will show access denied)
        router.push('/admin')
        return
      }
    }
  }, [user, isAdmin, loading, requireAdmin, router])

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Don't render children if user is not authenticated or not admin (when required)
  if (!user || (requireAdmin && !isAdmin)) {
    return null
  }

  // All checks passed, render the protected content
  return <>{children}</>
}