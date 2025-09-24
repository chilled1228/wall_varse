const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// Firebase config
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

async function checkData() {
  try {
    console.log('📊 Checking Firebase data...\n');

    const wallpapersCollection = collection(db, 'wallpapers');
    const snapshot = await getDocs(wallpapersCollection);

    console.log(`✅ Found ${snapshot.docs.length} wallpapers in database:\n`);

    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ${data.title}`);
      console.log(`   ID: ${doc.id}`);
      console.log(`   Category: ${data.category}`);
      console.log(`   Downloads: ${data.downloads.toLocaleString()}`);
      console.log(`   Likes: ${data.likes}`);
      console.log(`   Resolution: ${data.resolution}`);
      console.log(`   File Size: ${data.fileSize}`);
      console.log(`   Image URL: ${data.imageUrl}`);
      console.log(`   Tags: ${data.tags.join(', ')}`);
      console.log('');
    });

    // Check categories
    const categories = [...new Set(snapshot.docs.map(doc => doc.data().category))];
    console.log(`📂 Available categories: ${categories.join(', ')}\n`);

    console.log('🎉 Database check completed successfully!');

  } catch (error) {
    console.error('❌ Error checking data:', error);
  }
}

// Run the check
checkData();