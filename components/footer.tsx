"use client"

import { Button } from "@/components/ui/button"
import { Download, Heart, Github, Twitter, Instagram } from "lucide-react"
import Link from "next/link"
import { siteConfig } from "@/lib/config"

export function Footer() {
  return (
    <footer className="brutalist-border border-t-4 bg-card mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="brutalist-border brutalist-shadow bg-accent p-2">
                <Download className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-card-foreground">{siteConfig.name}</h3>
            </div>
            <p className="text-sm font-bold text-muted-foreground mb-4">
              FREE HIGH-QUALITY MOBILE WALLPAPERS. NO SIGNUP. NO BS.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="brutalist-border bg-transparent">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="brutalist-border bg-transparent">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="brutalist-border bg-transparent">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-black text-card-foreground mb-4">CATEGORIES</h4>
            <div className="space-y-2">
              {["nature", "abstract", "minimal", "dark", "colorful", "space"].map((category) => (
                <Link key={category} href={`/category/${category}`}>
                  <Button variant="ghost" className="w-full justify-start p-0 h-auto font-bold text-sm">
                    {category.toUpperCase()}
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-black text-card-foreground mb-4">QUICK LINKS</h4>
            <div className="space-y-2">
              <Link href="/">
                <Button variant="ghost" className="w-full justify-start p-0 h-auto font-bold text-sm">
                  HOME
                </Button>
              </Link>
              <Link href="/search">
                <Button variant="ghost" className="w-full justify-start p-0 h-auto font-bold text-sm">
                  SEARCH
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" className="w-full justify-start p-0 h-auto font-bold text-sm">
                  ABOUT
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="w-full justify-start p-0 h-auto font-bold text-sm">
                  CONTACT
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div>
            <h4 className="text-lg font-black text-card-foreground mb-4">STATS</h4>
            <div className="space-y-3">
              <div className="brutalist-border bg-secondary p-3">
                <div className="text-2xl font-black text-secondary-foreground">10K+</div>
                <div className="text-xs font-bold text-secondary-foreground">WALLPAPERS</div>
              </div>
              <div className="brutalist-border bg-accent p-3">
                <div className="text-2xl font-black text-accent-foreground">50K+</div>
                <div className="text-xs font-bold text-accent-foreground">DOWNLOADS</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t-2 border-border">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-bold text-muted-foreground text-center sm:text-left">
              © 2024 {siteConfig.name}. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-4 text-sm font-bold text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground">
                PRIVACY
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                TERMS
              </Link>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3 fill-current text-destructive" />
                <span>MADE WITH LOVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
