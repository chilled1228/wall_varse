"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchBarProps {
  defaultValue?: string
}

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(defaultValue)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setSearchQuery(defaultValue)
  }, [defaultValue])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams)
      params.set("q", searchQuery.trim())
      router.push(`/search?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-4">
      <div className="flex-1">
        <Input
          type="text"
          placeholder="SEARCH WALLPAPERS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="brutalist-border h-14 text-lg font-bold placeholder:text-muted-foreground"
        />
      </div>
      <Button type="submit" className="brutalist-border brutalist-shadow h-14 px-8 font-black text-lg">
        <Search className="h-5 w-5 mr-2" />
        SEARCH
      </Button>
    </form>
  )
}
