// Create Admin User in Firebase
const admin = require('firebase-admin');
const serviceAccount = require('./config/pja3d-fire-firebase-adminsdk-fbsvc-96219dabc7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function createAdmin() {
  console.log('🔐 Creating admin user...\n');
  
  const adminData = {
    email: 'pushkarjay.ajay1@gmail.com',
    password: 'pja3d@admin2025', // CHANGE THIS AFTER FIRST LOGIN!
    displayName: 'Pushkarjay Ajay',
    emailVerified: true
  };
  
  try {
    // Create Firebase Authentication user
    let user;
    try {
      user = await auth.createUser(adminData);
      console.log('✅ Firebase Auth user created:', user.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists in Authentication, getting user...');
        user = await auth.getUserByEmail(adminData.email);
        console.log('✅ Found existing user:', user.uid);
      } else {
        throw error;
      }
    }
    
    // Create Firestore user document
    const userDoc = {
      email: adminData.email,
      displayName: adminData.displayName,
      username: 'pushkarjay',
      role: 'admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      uid: user.uid
    };
    
    await db.collection('users').doc(user.uid).set(userDoc);
    console.log('✅ Firestore user document created\n');
    
    console.log('═══════════════════════════════════════');
    console.log('🎉 Admin user created successfully!');
    console.log('═══════════════════════════════════════');
    console.log('\n📧 Email:', adminData.email);
    console.log('👤 Username: pushkarjay');
    console.log('🔑 Password:', adminData.password);
    console.log('🌐 Admin URL: https://pja3d-fire.web.app/admin.html');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('═══════════════════════════════════════\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
