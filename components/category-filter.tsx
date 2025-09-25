"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

interface CategoryOption {
  slug: string
  name: string
}

export function CategoryFilter() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories, setCategories] = useState<CategoryOption[]>([{ slug: "all", name: "ALL" }])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  // Load dynamic categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.categories) {
            const dynamicCategories = data.categories.map((cat: any) => ({
              slug: cat.slug,
              name: cat.name
            }))
            setCategories([
              { slug: "all", name: "ALL" },
              ...dynamicCategories
            ])
          }
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    if (pathname.startsWith("/category/")) {
      const categorySlug = pathname.split("/category/")[1]
      setActiveCategory(categorySlug || "all")
    } else if (searchParams.get("category")) {
      setActiveCategory(searchParams.get("category") || "all")
    } else {
      setActiveCategory("all")
    }
  }, [pathname, searchParams])

  const handleCategoryClick = (categorySlug: string) => {
    setActiveCategory(categorySlug)

    if (categorySlug === "all") {
      router.push("/")
    } else if (pathname.startsWith("/search")) {
      const params = new URLSearchParams(searchParams)
      params.set("category", categorySlug)
      router.push(`/search?${params.toString()}`)
    } else {
      router.push(`/category/${categorySlug}`)
    }
  }

  return (
    <div className="brutalist-border brutalist-shadow bg-card p-6">
      <h3 className="text-2xl font-black text-card-foreground mb-4">CATEGORIES</h3>
      <div className="flex flex-wrap gap-3">
        {loading ? (
          <div className="text-muted-foreground font-bold">Loading categories...</div>
        ) : (
          categories.map((category) => (
            <Button
              key={category.slug}
              variant={activeCategory === category.slug ? "default" : "outline"}
              onClick={() => handleCategoryClick(category.slug)}
              className={`brutalist-border font-black text-sm ${
                activeCategory === category.slug
                  ? "brutalist-shadow bg-accent text-accent-foreground"
                  : "hover:bg-secondary hover:text-secondary-foreground"
              }`}
            >
              {category.name}
            </Button>
          ))
        )}
      </div>
    </div>
  )
}
