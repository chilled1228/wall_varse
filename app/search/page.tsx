import { Header } from "@/components/header"
import { WallpaperGrid } from "@/components/wallpaper-grid"
import { CategoryFilter } from "@/components/category-filter"
import { SearchBar } from "@/components/search-bar"
import type { Metadata } from "next"

interface SearchPageProps {
  searchParams: {
    q?: string
    category?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || ""
  const category = searchParams.category || ""

  let title = "Search Results - WALLPAPER ZONE"
  let description = "Search results for wallpapers"

  if (query) {
    title = `"${query}" Search Results - WALLPAPER ZONE`
    description = `Search results for "${query}" wallpapers`
  }

  if (category) {
    title = `${category.toUpperCase()} Search Results - WALLPAPER ZONE`
    description = `Search results for ${category} wallpapers`
  }

  return {
    title,
    description,
    keywords: `${query} wallpapers, ${category} wallpapers, search wallpapers, mobile wallpapers`,
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const category = searchParams.category || ""

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="brutalist-border brutalist-shadow bg-secondary p-8 mb-8">
            <h1 className="text-5xl font-black text-secondary-foreground mb-4 text-balance">SEARCH RESULTS</h1>
            {query && (
              <p className="text-xl font-bold text-secondary-foreground mb-2">
                SHOWING RESULTS FOR: "{query.toUpperCase()}"
              </p>
            )}
            {category && (
              <p className="text-lg font-bold text-secondary-foreground">CATEGORY: {category.toUpperCase()}</p>
            )}
            {!query && !category && (
              <p className="text-xl font-bold text-secondary-foreground">ENTER A SEARCH TERM TO FIND WALLPAPERS</p>
            )}
          </div>

          <SearchBar defaultValue={query} />
        </section>

        <section className="mb-8">
          <CategoryFilter />
        </section>

        <section>
          <WallpaperGrid searchQuery={query} category={category} />
        </section>
      </main>
    </div>
  )
}
