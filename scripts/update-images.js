const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, updateDoc, getDocs } = require('firebase/firestore');

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

async function updateImageUrls() {
  try {
    console.log('Updating image URLs to use placeholder images...');

    const wallpapersCollection = collection(db, 'wallpapers');
    const snapshot = await getDocs(wallpapersCollection);

    let updateCount = 0;

    for (const docSnapshot of snapshot.docs) {
      const docId = docSnapshot.id;
      const data = docSnapshot.data();

      // Extract number from document ID or use a random number
      const randomNum = docId.replace('wallpaper-', '') || Math.floor(Math.random() * 100);
      const newImageUrl = `https://picsum.photos/400/600?random=${randomNum}`;

      await updateDoc(doc(wallpapersCollection, docId), {
        imageUrl: newImageUrl
      });

      console.log(`✅ Updated ${data.title}: ${newImageUrl}`);
      updateCount++;
    }

    console.log(`🎉 Successfully updated ${updateCount} wallpaper images!`);

  } catch (error) {
    console.error('❌ Error updating images:', error);
  }
}

// Run the update
updateImageUrls();