import { type NextRequest, NextResponse } from "next/server"

const searchSuggestions = [
  "nature",
  "abstract",
  "minimal",
  "dark",
  "colorful",
  "space",
  "animals",
  "cars",
  "architecture",
  "neon",
  "city",
  "lights",
  "urban",
  "mountain",
  "landscape",
  "snow",
  "peak",
  "waves",
  "clean",
  "simple",
  "nebula",
  "galaxy",
  "stars",
  "forest",
  "night",
  "trees",
  "geometric",
  "art",
  "pattern",
  "rainbow",
  "gradient",
  "bright",
  "wolf",
  "wildlife",
  "sports",
  "automotive",
  "vehicle",
  "building",
  "modern",
  "structure",
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase() || ""

  if (!query) {
    return NextResponse.json({ suggestions: [] })
  }

  const filteredSuggestions = searchSuggestions
    .filter((suggestion) => suggestion.toLowerCase().includes(query))
    .slice(0, 8) // Limit to 8 suggestions

  return NextResponse.json({ suggestions: filteredSuggestions })
}
