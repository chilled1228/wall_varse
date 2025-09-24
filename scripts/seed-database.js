const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

// Firebase config - using environment variables from .env.local
const firebaseConfig = {
  apiKey: "AIzaSyAkZw8fGueAx0itgp1dSBtPMm1n2EkEIYk",
  authDomain: "wallpaperverce.firebaseapp.com",
  projectId: "wallpaperverce",
  storageBucket: "wallpaperverce.firebasestorage.app",
  messagingSenderId: "270943142364",
  appId: "1:270943142364:web:9ebf51713d68dcff58cf19",
  measurementId: "G-26BCN2FG2E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleWallpapers = [
  {
    title: "NEON CITY",
    category: "abstract",
    downloads: 1234,
    likes: 89,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/neon-city.jpg",
    resolution: "1080x1920",
    tags: ["neon", "city", "lights", "urban"],
    fileSize: "2.4 MB",
    createdAt: new Date(),
  },
  {
    title: "MOUNTAIN PEAK",
    category: "nature",
    downloads: 2156,
    likes: 156,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/mountain-peak.jpg",
    resolution: "1080x1920",
    tags: ["mountain", "landscape", "snow", "peak"],
    fileSize: "3.1 MB",
    createdAt: new Date(),
  },
  {
    title: "MINIMAL WAVES",
    category: "minimal",
    downloads: 987,
    likes: 67,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/minimal-waves.jpg",
    resolution: "1080x1920",
    tags: ["waves", "minimal", "clean", "simple"],
    fileSize: "1.8 MB",
    createdAt: new Date(),
  },
  {
    title: "SPACE NEBULA",
    category: "space",
    downloads: 3421,
    likes: 234,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/space-nebula.jpg",
    resolution: "1080x1920",
    tags: ["space", "nebula", "galaxy", "stars"],
    fileSize: "4.2 MB",
    createdAt: new Date(),
  },
  {
    title: "DARK FOREST",
    category: "dark",
    downloads: 1876,
    likes: 123,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/dark-forest.jpg",
    resolution: "1080x1920",
    tags: ["forest", "dark", "night", "trees"],
    fileSize: "2.9 MB",
    createdAt: new Date(),
  },
  {
    title: "GEOMETRIC ART",
    category: "abstract",
    downloads: 1543,
    likes: 98,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/geometric-art.jpg",
    resolution: "1080x1920",
    tags: ["geometric", "abstract", "art", "pattern"],
    fileSize: "2.1 MB",
    createdAt: new Date(),
  },
  {
    title: "RAINBOW GRADIENT",
    category: "colorful",
    downloads: 2341,
    likes: 187,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/rainbow-gradient.jpg",
    resolution: "1080x1920",
    tags: ["rainbow", "gradient", "colorful", "bright"],
    fileSize: "3.5 MB",
    createdAt: new Date(),
  },
  {
    title: "WOLF PORTRAIT",
    category: "animals",
    downloads: 1654,
    likes: 134,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/wolf-portrait.jpg",
    resolution: "1080x1920",
    tags: ["wolf", "animal", "portrait", "wildlife"],
    fileSize: "2.7 MB",
    createdAt: new Date(),
  },
  {
    title: "SPORTS CAR",
    category: "cars",
    downloads: 2987,
    likes: 245,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/sports-car.jpg",
    resolution: "1080x1920",
    tags: ["car", "sports", "automotive", "vehicle"],
    fileSize: "3.8 MB",
    createdAt: new Date(),
  },
  {
    title: "MODERN BUILDING",
    category: "architecture",
    downloads: 1432,
    likes: 89,
    imageUrl: "https://pub-141831e61e69445289222976a15b6fb3.r2.dev/modern-building.jpg",
    resolution: "1080x1920",
    tags: ["building", "architecture", "modern", "structure"],
    fileSize: "2.6 MB",
    createdAt: new Date(),
  },
];

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    const wallpapersCollection = collection(db, 'wallpapers');

    for (let i = 0; i < sampleWallpapers.length; i++) {
      const wallpaper = sampleWallpapers[i];
      const docRef = doc(wallpapersCollection, `wallpaper-${i + 1}`);

      await setDoc(docRef, wallpaper);
      console.log(`✅ Added wallpaper: ${wallpaper.title}`);
    }

    console.log('🎉 Successfully seeded all wallpapers!');
    console.log(`📊 Total wallpapers added: ${sampleWallpapers.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeding
seedDatabase();