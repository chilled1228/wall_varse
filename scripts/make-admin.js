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

async function makeFirstUserAdmin(email) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    const adminUsersCollection = collection(db, 'admin_users');
    const snapshot = await getDocs(adminUsersCollection);

    let userFound = false;

    for (const docSnapshot of snapshot.docs) {
      const userData = docSnapshot.data();

      if (userData.email === email) {
        userFound = true;
        const userDoc = doc(adminUsersCollection, docSnapshot.id);

        await updateDoc(userDoc, {
          isAdmin: true
        });

        console.log(`✅ SUCCESS: ${userData.displayName || email} is now an admin!`);
        console.log(`   - User ID: ${docSnapshot.id}`);
        console.log(`   - Email: ${userData.email}`);
        console.log(`   - Display Name: ${userData.displayName || 'Not set'}`);
        break;
      }
    }

    if (!userFound) {
      console.log(`❌ User with email ${email} not found.`);
      console.log(`📝 Note: The user must sign in to the admin panel at least once before being granted admin rights.`);
      console.log(`\n🔗 Admin login URL: http://localhost:3001/admin`);

      // List all existing users
      console.log(`\n👥 Existing users in database:`);
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`   ${index + 1}. ${data.email} (${data.displayName || 'No name'}) - Admin: ${data.isAdmin ? 'YES' : 'NO'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error making user admin:', error);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('❌ Please provide an email address:');
  console.log('   node scripts/make-admin.js your-email@gmail.com');
  process.exit(1);
}

// Run the function
makeFirstUserAdmin(email);