import { NextResponse } from "next/server"

const categories = [
  {
    slug: "nature",
    name: "NATURE",
    description: "Beautiful landscapes, forests, mountains, and natural scenes",
    count: 156,
    featured: true,
  },
  {
    slug: "abstract",
    name: "ABSTRACT",
    description: "Artistic patterns, geometric shapes, and creative designs",
    count: 234,
    featured: true,
  },
  {
    slug: "minimal",
    name: "MINIMAL",
    description: "Clean, simple designs with plenty of white space",
    count: 89,
    featured: true,
  },
  {
    slug: "dark",
    name: "DARK",
    description: "Dark themes perfect for OLED displays and night mode",
    count: 198,
    featured: true,
  },
  {
    slug: "colorful",
    name: "COLORFUL",
    description: "Vibrant, bright wallpapers full of color",
    count: 145,
    featured: false,
  },
  {
    slug: "space",
    name: "SPACE",
    description: "Galaxies, planets, stars, and cosmic phenomena",
    count: 112,
    featured: false,
  },
  {
    slug: "animals",
    name: "ANIMALS",
    description: "Wildlife, pets, and animal photography",
    count: 167,
    featured: false,
  },
  {
    slug: "cars",
    name: "CARS",
    description: "Sports cars, vintage automobiles, and automotive art",
    count: 78,
    featured: false,
  },
  {
    slug: "architecture",
    name: "ARCHITECTURE",
    description: "Buildings, structures, and architectural photography",
    count: 134,
    featured: false,
  },
]

export async function GET() {
  return NextResponse.json({
    categories,
    total: categories.length,
    featured: categories.filter((cat) => cat.featured),
  })
}
