import { wallpaperService } from './wallpaper-service'

interface RedirectRule {
  from: string
  to: string
  type: '301' | '302'
  active: boolean
  createdAt: Date
}

export class RedirectService {
  private static instance: RedirectService
  private redirectRules: Map<string, RedirectRule> = new Map()

  static getInstance(): RedirectService {
    if (!RedirectService.instance) {
      RedirectService.instance = new RedirectService()
    }
    return RedirectService.instance
  }

  /**
   * Handle legacy wallpaper URLs and redirect to new slug-based URLs
   */
  async handleLegacyWallpaperUrl(identifier: string): Promise<{ shouldRedirect: boolean; to?: string; type?: string }> {
    try {
      // Check if this is a legacy ID (Firestore document ID)
      const wallpaper = await wallpaperService.getWallpaperById(identifier)

      if (wallpaper && wallpaper.slug) {
        // This is a legacy ID with a slug, redirect to slug URL
        return {
          shouldRedirect: true,
          to: `/wallpaper-page/${wallpaper.slug}`,
          type: '301' // Permanent redirect
        }
      }

      // Check for legacy numeric patterns (wallpaper-1, wallpaper-2, etc.)
      if (identifier.startsWith('wallpaper-')) {
        const numericId = identifier.replace('wallpaper-', '')
        const numericWallpaper = await wallpaperService.getWallpaperById(numericId)

        if (numericWallpaper && numericWallpaper.slug) {
          return {
            shouldRedirect: true,
            to: `/wallpaper/${numericWallpaper.slug}`,
            type: '301'
          }
        }
      }

      // No redirect needed
      return { shouldRedirect: false }

    } catch (error) {
      console.error('Error handling legacy URL:', error)
      return { shouldRedirect: false }
    }
  }

  /**
   * Add a custom redirect rule
   */
  addRedirectRule(from: string, to: string, type: '301' | '302' = '301'): void {
    const rule: RedirectRule = {
      from,
      to,
      type,
      active: true,
      createdAt: new Date()
    }

    this.redirectRules.set(from, rule)
  }

  /**
   * Get redirect destination for a given path
   */
  async getRedirect(path: string): Promise<RedirectRule | null> {
    // Check custom redirect rules first
    const customRule = this.redirectRules.get(path)
    if (customRule && customRule.active) {
      return customRule
    }

    // Check for legacy wallpaper URLs
    const wallpaperMatch = path.match(/^\/wallpaper\/([^\/]+)$/)
    if (wallpaperMatch) {
      const identifier = wallpaperMatch[1]
      const redirect = await this.handleLegacyWallpaperUrl(identifier)

      if (redirect.shouldRedirect && redirect.to) {
        return {
          from: path,
          to: redirect.to,
          type: (redirect.type as '301' | '302') || '301',
          active: true,
          createdAt: new Date()
        }
      }
    }

    return null
  }

  /**
   * Generate legacy URL redirect mapping
   */
  async generateLegacyRedirects(): Promise<Array<{ from: string; to: string; title: string }>> {
    try {
      const wallpapers = await wallpaperService.getAllWallpapers()
      const redirects: Array<{ from: string; to: string; title: string }> = []

      for (const wallpaper of wallpapers) {
        if (wallpaper.slug) {
          // Add redirect from ID to slug
          redirects.push({
            from: `/wallpaper/${wallpaper.id}`,
            to: `/wallpaper-page/${wallpaper.slug}`,
            title: wallpaper.title
          })

          // Add redirect from legacy numeric ID if applicable
          if (wallpaper.id && /^\d+$/.test(wallpaper.id)) {
            redirects.push({
              from: `/wallpaper/wallpaper-${wallpaper.id}`,
              to: `/wallpaper-page/${wallpaper.slug}`,
              title: wallpaper.title
            })
          }
        }
      }

      return redirects
    } catch (error) {
      console.error('Error generating legacy redirects:', error)
      return []
    }
  }

  /**
   * Check if a path needs redirect
   */
  async needsRedirect(path: string): Promise<boolean> {
    const redirect = await this.getRedirect(path)
    return redirect !== null
  }

  /**
   * Get all active redirect rules
   */
  getActiveRedirects(): RedirectRule[] {
    return Array.from(this.redirectRules.values()).filter(rule => rule.active)
  }

  /**
   * Remove a redirect rule
   */
  removeRedirectRule(from: string): boolean {
    return this.redirectRules.delete(from)
  }

  /**
   * Toggle redirect rule active status
   */
  toggleRedirectRule(from: string): boolean {
    const rule = this.redirectRules.get(from)
    if (rule) {
      rule.active = !rule.active
      return true
    }
    return false
  }
}

// Export singleton instance
export const redirectService = RedirectService.getInstance()