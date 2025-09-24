import { type NextRequest, NextResponse } from "next/server"

// Mock wallpaper data - in production this would come from a database
const wallpapers = [
  {
    id: 1,
    title: "NEON CITY",
    category: "abstract",
    downloads: 1234,
    likes: 89,
    imageUrl: "https://picsum.photos/1080/1920?random=1",
    resolution: "1080x1920",
    tags: ["neon", "city", "lights", "urban"],
    fileSize: "2.4 MB",
  },
  {
    id: 2,
    title: "MOUNTAIN PEAK",
    category: "nature",
    downloads: 2156,
    likes: 156,
    imageUrl: "https://picsum.photos/1080/1920?random=2",
    resolution: "1080x1920",
    tags: ["mountain", "landscape", "snow", "peak"],
    fileSize: "3.1 MB",
  },
  // Add more wallpapers as needed
]

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const wallpaperId = Number.parseInt(params.id)
    const wallpaper = wallpapers.find((w) => w.id === wallpaperId)

    if (!wallpaper) {
      return NextResponse.json({ error: "Wallpaper not found" }, { status: 404 })
    }

    // In production, you would:
    // 1. Increment download counter in database
    // 2. Log download analytics
    // 3. Serve actual high-resolution image file
    // 4. Handle rate limiting and abuse prevention

    // For demo purposes, we'll redirect to a placeholder image
    const imageResponse = await fetch(wallpaper.imageUrl)

    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch wallpaper" }, { status: 500 })
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${wallpaper.title.replace(/\s+/g, "_")}_${wallpaper.resolution}.jpg"`,
        "Content-Length": imageBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("Download error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
