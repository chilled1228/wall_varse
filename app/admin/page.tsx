"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, LogIn, Shield, AlertCircle } from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"
import { useToast } from "@/hooks/use-toast"

export default function AdminLoginPage() {
  const router = useRouter()
  const { user, adminUser, isAdmin, loading, signInWithGoogle } = useAdmin()
  const { toast } = useToast()
  const [signingIn, setSigningIn] = useState(false)

  useEffect(() => {
    // Redirect to dashboard if user is already an admin
    if (isAdmin && !loading) {
      router.push('/admin/dashboard')
    }
  }, [isAdmin, loading, router])

  const handleSignIn = async () => {
    try {
      setSigningIn(true)
      await signInWithGoogle()

      toast({
        title: "SIGNED IN SUCCESSFULLY!",
        description: "Welcome to the admin panel",
      })
    } catch (error) {
      console.error('Sign in error:', error)
      toast({
        title: "SIGN IN FAILED!",
        description: "Please try again or contact support",
        variant: "destructive",
      })
    } finally {
      setSigningIn(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is logged in but not admin
  if (user && adminUser && !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 brutalist-border brutalist-shadow bg-card text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-black text-card-foreground mb-4">ACCESS DENIED</h1>
          <p className="text-muted-foreground mb-6">
            You are signed in as <strong>{adminUser.email}</strong>, but you don't have admin privileges.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Contact the site administrator to request admin access.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full brutalist-border brutalist-shadow font-black"
            >
              GO TO MAIN SITE
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Main login page
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 brutalist-border brutalist-shadow bg-card">
        <div className="text-center mb-8">
          <div className="brutalist-border bg-primary p-4 w-fit mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-card-foreground mb-2">ADMIN LOGIN</h1>
          <p className="text-muted-foreground">
            Sign in with Google to access the wallpaper admin panel
          </p>
        </div>

        <div className="space-y-6">
          <Button
            onClick={handleSignIn}
            disabled={signingIn}
            className="w-full brutalist-border brutalist-shadow font-black text-lg py-6"
            size="lg"
          >
            {signingIn ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                SIGNING IN...
              </>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                SIGN IN WITH GOOGLE
              </>
            )}
          </Button>

          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-muted-foreground hover:text-foreground font-bold"
            >
              ← Back to Main Site
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 brutalist-border bg-secondary text-center">
          <p className="text-xs text-secondary-foreground font-bold">
            🔒 SECURE ADMIN ACCESS
          </p>
          <p className="text-xs text-secondary-foreground mt-1">
            Only authorized users can access this panel
          </p>
        </div>
      </Card>
    </div>
  )
}