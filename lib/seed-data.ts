import { collection, addDoc, doc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface Wallpaper {
  id: string
  title: string
  slug: string
  category: string
  downloads: number
  likes: number
  imageUrl: string
  resolution: string
  deviceType: string
  tags: string[]
  fileSize: string
  createdAt: Date
}

export const sampleWallpapers: Omit<Wallpaper, 'id'>[] = [
  {
    title: "NEON CITY",
    slug: "neon-city",
    category: "abstract",
    downloads: 1234,
    likes: 89,
    imageUrl: "https://picsum.photos/400/600?random=1",
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["neon", "city", "lights", "urban"],
    fileSize: "2.4 MB",
    createdAt: new Date(),
  },
  {
    title: "MOUNTAIN PEAK",
    slug: "mountain-peak",
    category: "nature",
    downloads: 2156,
    likes: 156,
    imageUrl: `${process.env.R2_PUBLIC_URL}/mountain-peak.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["mountain", "landscape", "snow", "peak"],
    fileSize: "3.1 MB",
    createdAt: new Date(),
  },
  {
    title: "MINIMAL WAVES",
    slug: "minimal-waves",
    category: "minimal",
    downloads: 987,
    likes: 67,
    imageUrl: `${process.env.R2_PUBLIC_URL}/minimal-waves.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["waves", "minimal", "clean", "simple"],
    fileSize: "1.8 MB",
    createdAt: new Date(),
  },
  {
    title: "SPACE NEBULA",
    slug: "space-nebula",
    category: "space",
    downloads: 3421,
    likes: 234,
    imageUrl: `${process.env.R2_PUBLIC_URL}/space-nebula.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["space", "nebula", "galaxy", "stars"],
    fileSize: "4.2 MB",
    createdAt: new Date(),
  },
  {
    title: "DARK FOREST",
    slug: "dark-forest",
    category: "dark",
    downloads: 1876,
    likes: 123,
    imageUrl: `${process.env.R2_PUBLIC_URL}/dark-forest.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["forest", "dark", "night", "trees"],
    fileSize: "2.9 MB",
    createdAt: new Date(),
  },
  {
    title: "GEOMETRIC ART",
    slug: "geometric-art",
    category: "abstract",
    downloads: 1543,
    likes: 98,
    imageUrl: `${process.env.R2_PUBLIC_URL}/geometric-art.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["geometric", "abstract", "art", "pattern"],
    fileSize: "2.1 MB",
    createdAt: new Date(),
  },
  {
    title: "RAINBOW GRADIENT",
    slug: "rainbow-gradient",
    category: "colorful",
    downloads: 2341,
    likes: 187,
    imageUrl: `${process.env.R2_PUBLIC_URL}/rainbow-gradient.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["rainbow", "gradient", "colorful", "bright"],
    fileSize: "3.5 MB",
    createdAt: new Date(),
  },
  {
    title: "WOLF PORTRAIT",
    slug: "wolf-portrait",
    category: "animals",
    downloads: 1654,
    likes: 134,
    imageUrl: `${process.env.R2_PUBLIC_URL}/wolf-portrait.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["wolf", "animal", "portrait", "wildlife"],
    fileSize: "2.7 MB",
    createdAt: new Date(),
  },
  {
    title: "SPORTS CAR",
    slug: "sports-car",
    category: "cars",
    downloads: 2987,
    likes: 245,
    imageUrl: `${process.env.R2_PUBLIC_URL}/sports-car.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["car", "sports", "automotive", "vehicle"],
    fileSize: "3.8 MB",
    createdAt: new Date(),
  },
  {
    title: "MODERN BUILDING",
    slug: "modern-building",
    category: "architecture",
    downloads: 1432,
    likes: 89,
    imageUrl: `${process.env.R2_PUBLIC_URL}/modern-building.jpg`,
    resolution: "1080x1920",
    deviceType: "phone",
    tags: ["building", "architecture", "modern", "structure"],
    fileSize: "2.6 MB",
    createdAt: new Date(),
  },
]

export async function seedWallpapers() {
  try {
    const wallpapersCollection = collection(db, 'wallpapers')

    for (let i = 0; i < sampleWallpapers.length; i++) {
      const wallpaper = sampleWallpapers[i]
      const docRef = doc(wallpapersCollection, `wallpaper-${i + 1}`)
      await setDoc(docRef, wallpaper)
      console.log(`Added wallpaper: ${wallpaper.title}`)
    }

    console.log('Successfully seeded all wallpapers!')
    return true
  } catch (error) {
    console.error('Error seeding wallpapers:', error)
    return false
  }
}