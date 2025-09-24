"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AdminRouteGuard } from "@/components/admin-route-guard"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  LogOut,
  Users,
  Image as ImageIcon,
  Settings,
  Shield,
  Download,
  Heart,
  Eye,
  Plus,
  UserCheck,
  UserX
} from "lucide-react"
import { useAdmin } from "@/contexts/admin-context"
import { useToast } from "@/hooks/use-toast"
import { wallpaperService, type WallpaperWithId } from "@/lib/wallpaper-service"
import { adminService, type AdminUser } from "@/lib/admin-service"
import { WallpaperForm } from "@/components/admin/wallpaper-form"
import { EditWallpaperDialog } from "@/components/admin/edit-wallpaper-dialog"
import { DeleteWallpaperDialog } from "@/components/admin/delete-wallpaper-dialog"
import { BulkImportDialog } from "@/components/admin/bulk-import-dialog"

function AdminDashboardContent() {
  const router = useRouter()
  const { user, adminUser, isAdmin, loading, signOut } = useAdmin()
  const { toast } = useToast()

  const [wallpapers, setWallpapers] = useState<WallpaperWithId[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [loadingWallpapers, setLoadingWallpapers] = useState(true)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [stats, setStats] = useState({
    totalWallpapers: 0,
    totalDownloads: 0,
    totalLikes: 0,
    totalAdmins: 0
  })

  // Load data on component mount
  useEffect(() => {
    loadWallpapers()
    loadAdminUsers()
  }, [])

  const loadWallpapers = async () => {
    try {
      setLoadingWallpapers(true)
      const data = await wallpaperService.getAllWallpapers()
      setWallpapers(data)

      // Calculate stats
      const totalDownloads = data.reduce((sum, w) => sum + w.downloads, 0)
      const totalLikes = data.reduce((sum, w) => sum + w.likes, 0)

      setStats(prev => ({
        ...prev,
        totalWallpapers: data.length,
        totalDownloads,
        totalLikes
      }))
    } catch (error) {
      console.error('Error loading wallpapers:', error)
      toast({
        title: "ERROR LOADING WALLPAPERS",
        description: "Failed to load wallpapers data",
        variant: "destructive",
      })
    } finally {
      setLoadingWallpapers(false)
    }
  }

  const loadAdminUsers = async () => {
    try {
      setLoadingUsers(true)
      const data = await adminService.getAllAdminUsers()
      setAdminUsers(data)

      const totalAdmins = data.filter(u => u.isAdmin).length
      setStats(prev => ({
        ...prev,
        totalAdmins
      }))
    } catch (error) {
      console.error('Error loading admin users:', error)
      toast({
        title: "ERROR LOADING USERS",
        description: "Failed to load user data",
        variant: "destructive",
      })
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleMakeAdmin = async (uid: string) => {
    try {
      await adminService.makeUserAdmin(uid)
      await loadAdminUsers() // Refresh the list
      toast({
        title: "ADMIN RIGHTS GRANTED",
        description: "User has been granted admin privileges",
      })
    } catch (error) {
      console.error('Error making user admin:', error)
      toast({
        title: "ERROR",
        description: "Failed to grant admin rights",
        variant: "destructive",
      })
    }
  }

  const handleRemoveAdmin = async (uid: string) => {
    try {
      await adminService.removeAdminRights(uid)
      await loadAdminUsers() // Refresh the list
      toast({
        title: "ADMIN RIGHTS REMOVED",
        description: "Admin privileges have been revoked",
      })
    } catch (error) {
      console.error('Error removing admin rights:', error)
      toast({
        title: "ERROR",
        description: "Failed to remove admin rights",
        variant: "destructive",
      })
    }
  }

  const handleWallpaperUploaded = (newWallpaper: WallpaperWithId) => {
    setWallpapers(prev => [newWallpaper, ...prev])
    setShowUploadForm(false)
    loadWallpapers() // Refresh to get accurate stats
  }

  const handleWallpaperUpdated = (updatedWallpaper: WallpaperWithId) => {
    setWallpapers(prev =>
      prev.map(w => w.id === updatedWallpaper.id ? updatedWallpaper : w)
    )
  }

  const handleWallpaperDeleted = (deletedId: string) => {
    setWallpapers(prev => prev.filter(w => w.id !== deletedId))
    loadWallpapers() // Refresh stats
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/admin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg font-bold text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="brutalist-border-b bg-card p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="brutalist-border bg-primary p-2">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-card-foreground">ADMIN DASHBOARD</h1>
              <p className="text-muted-foreground">
                Welcome back, <strong>{adminUser?.displayName || adminUser?.email}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="brutalist-border font-bold"
            >
              VIEW SITE
            </Button>
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="brutalist-border font-bold"
            >
              <LogOut className="h-4 w-4 mr-2" />
              SIGN OUT
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="brutalist-border brutalist-shadow bg-card p-6">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-muted-foreground">WALLPAPERS</p>
                <p className="text-2xl font-black text-card-foreground">{stats.totalWallpapers}</p>
              </div>
            </div>
          </Card>

          <Card className="brutalist-border brutalist-shadow bg-card p-6">
            <div className="flex items-center gap-3">
              <Download className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm font-bold text-muted-foreground">DOWNLOADS</p>
                <p className="text-2xl font-black text-card-foreground">{stats.totalDownloads.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="brutalist-border brutalist-shadow bg-card p-6">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm font-bold text-muted-foreground">LIKES</p>
                <p className="text-2xl font-black text-card-foreground">{stats.totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="brutalist-border brutalist-shadow bg-card p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm font-bold text-muted-foreground">ADMINS</p>
                <p className="text-2xl font-black text-card-foreground">{stats.totalAdmins}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="wallpapers" className="space-y-4">
          <TabsList className="brutalist-border bg-secondary">
            <TabsTrigger value="wallpapers" className="font-bold">
              <ImageIcon className="h-4 w-4 mr-2" />
              WALLPAPERS
            </TabsTrigger>
            <TabsTrigger value="users" className="font-bold">
              <Users className="h-4 w-4 mr-2" />
              USER MANAGEMENT
            </TabsTrigger>
          </TabsList>

          {/* Wallpapers Tab */}
          <TabsContent value="wallpapers">
            {showUploadForm ? (
              <WallpaperForm
                onSuccess={handleWallpaperUploaded}
                onCancel={() => setShowUploadForm(false)}
              />
            ) : (
              <Card className="brutalist-border brutalist-shadow bg-card">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-card-foreground">WALLPAPER MANAGEMENT</h2>
                    <div className="flex gap-2">
                      <BulkImportDialog onSuccess={loadWallpapers} />
                      <Button
                        onClick={() => setShowUploadForm(true)}
                        className="brutalist-border brutalist-shadow font-black"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        ADD WALLPAPER
                      </Button>
                    </div>
                  </div>

                {loadingWallpapers ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading wallpapers...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wallpapers.map((wallpaper) => (
                      <Card key={wallpaper.id} className="brutalist-border bg-card">
                        <div className="relative aspect-[2/3] overflow-hidden">
                          <img
                            src={wallpaper.imageUrl}
                            alt={wallpaper.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className="brutalist-border bg-secondary text-secondary-foreground">
                              {wallpaper.category.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-black text-card-foreground mb-2">{wallpaper.title}</h3>
                          <div className="flex justify-between text-sm text-muted-foreground mb-3">
                            <span className="flex items-center gap-1">
                              <Download className="h-3 w-3" />
                              {wallpaper.downloads.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {wallpaper.likes}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <EditWallpaperDialog
                              wallpaper={wallpaper}
                              onSuccess={handleWallpaperUpdated}
                            />
                            <DeleteWallpaperDialog
                              wallpaper={wallpaper}
                              onSuccess={handleWallpaperDeleted}
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
                </div>
              </Card>
            )}
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="brutalist-border brutalist-shadow bg-card">
              <div className="p-6">
                <h2 className="text-xl font-black text-card-foreground mb-6">USER MANAGEMENT</h2>

                {loadingUsers ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adminUsers.map((user) => (
                      <div
                        key={user.uid}
                        className="flex items-center justify-between p-4 brutalist-border bg-secondary rounded"
                      >
                        <div className="flex items-center gap-4">
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName || user.email}
                              className="w-10 h-10 rounded-full brutalist-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full brutalist-border bg-muted flex items-center justify-center">
                              <Users className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-secondary-foreground">
                              {user.displayName || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              Last login: {user.lastLogin.toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {user.isAdmin ? (
                            <>
                              <Badge className="bg-green-100 text-green-800 brutalist-border">
                                ADMIN
                              </Badge>
                              {user.uid !== adminUser?.uid && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRemoveAdmin(user.uid)}
                                  className="brutalist-border font-bold text-xs"
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  REMOVE ADMIN
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Badge className="bg-gray-100 text-gray-800 brutalist-border">
                                USER
                              </Badge>
                              <Button
                                size="sm"
                                onClick={() => handleMakeAdmin(user.uid)}
                                className="brutalist-border font-bold text-xs"
                              >
                                <UserCheck className="h-3 w-3 mr-1" />
                                MAKE ADMIN
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <AdminRouteGuard requireAdmin={true}>
      <AdminDashboardContent />
    </AdminRouteGuard>
  )
}