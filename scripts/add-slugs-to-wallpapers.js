const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');

// Firebase config (replace with your actual config)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Generate slug function (copied from slug-utils)
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[-\s]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function generateWallpaperSlug(title, id) {
  const baseSlug = generateSlug(title);
  const shortId = id.slice(-6);
  return `${baseSlug}-${shortId}`;
}

async function addSlugsToWallpapers() {
  try {
    console.log('🚀 Starting slug migration...');

    // Get all wallpapers
    const wallpapersCollection = collection(db, 'wallpapers');
    const snapshot = await getDocs(wallpapersCollection);

    console.log(`📝 Found ${snapshot.docs.length} wallpapers to update`);

    let updated = 0;
    let skipped = 0;

    for (const wallpaperDoc of snapshot.docs) {
      const data = wallpaperDoc.data();

      // Skip if already has slug
      if (data.slug) {
        skipped++;
        continue;
      }

      // Generate slug
      const slug = generateWallpaperSlug(data.title, wallpaperDoc.id);

      // Update document
      await updateDoc(doc(db, 'wallpapers', wallpaperDoc.id), {
        slug: slug
      });

      updated++;
      console.log(`✅ Updated "${data.title}" -> "${slug}"`);
    }

    console.log('');
    console.log('🎉 Migration complete!');
    console.log(`📊 Updated: ${updated} wallpapers`);
    console.log(`⏭️  Skipped: ${skipped} wallpapers (already had slugs)`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Run migration
addSlugsToWallpapers().then(() => {
  console.log('✨ Done!');
  process.exit(0);
});