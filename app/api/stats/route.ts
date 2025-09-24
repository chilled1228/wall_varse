import { NextResponse } from "next/server"

// Mock statistics - in production this would come from a database
const stats = {
  totalWallpapers: 1513,
  totalDownloads: 2847392,
  totalCategories: 9,
  dailyDownloads: 15847,
  popularCategories: [
    { name: "NATURE", downloads: 847392 },
    { name: "ABSTRACT", downloads: 634821 },
    { name: "DARK", downloads: 523847 },
    { name: "MINIMAL", downloads: 398472 },
  ],
  recentActivity: {
    newWallpapers: 23,
    period: "last 7 days",
  },
}

export async function GET() {
  return NextResponse.json(stats)
}
