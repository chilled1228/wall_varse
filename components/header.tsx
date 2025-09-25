"use client"

import { Button } from "@/components/ui/button"
import { Download, Menu, X, Home, Grid3X3, Search } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { siteConfig } from "@/lib/config"

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "HOME", icon: Home },
    { href: "/category/nature", label: "CATEGORIES", icon: Grid3X3 },
    { href: "/search", label: "SEARCH", icon: Search },
  ]

  return (
    <header className="brutalist-border border-b-4 bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 sm:gap-4">
            <div className="brutalist-border brutalist-shadow bg-accent p-1.5 sm:p-2">
              <Download className="h-5 w-5 sm:h-6 sm:w-6 text-accent-foreground" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-card-foreground">
              <span className="hidden sm:inline">{siteConfig.name}</span>
              <span className="sm:hidden">WV</span>
            </h2>
          </Link>

          <nav className="hidden md:flex items-center gap-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={`font-bold text-lg ${
                    pathname === item.href || (item.href.includes("category") && pathname.startsWith("/category"))
                      ? "bg-secondary"
                      : ""
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <Button
            variant="outline"
            size="icon"
            className="md:hidden brutalist-border bg-transparent"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pt-4 border-t-2 border-border">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start font-bold text-base ${
                        pathname === item.href || (item.href.includes("category") && pathname.startsWith("/category"))
                          ? "bg-secondary"
                          : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
