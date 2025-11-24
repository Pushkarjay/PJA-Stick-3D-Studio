#!/usr/bin/env node

/**
 * Script to create an admin user
 * Usage: node create-admin.js
 */

const readline = require('readline');
const admin = require('firebase-admin');

// Initialize Firebase Admin
// This uses the Firebase CLI authentication
try {
  // Try to use Firebase CLI credentials
  const projectId = process.env.GCP_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || 'pja3d-fire';
  
  admin.initializeApp({
    projectId: projectId,
  });
  
  console.log('✅ Firebase Admin initialized with project:', projectId);
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('\nℹ️  Make sure you are logged in to Firebase:');
  console.log('   firebase login');
  console.log('   gcloud auth application-default login');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdminUser() {
  console.log('\n🔐 Create Admin User\n');

  try {
    // Get user details
    const email = await question('Email: ');
    const password = await question('Password (min 6 characters): ');
    const displayName = await question('Display Name: ');

    if (!email || !password || password.length < 6) {
      console.error('❌ Email and password (min 6 chars) are required');
      rl.close();
      return;
    }

    console.log('\n⏳ Creating admin user...');

    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: displayName || 'Admin User',
        emailVerified: true,
      });
      console.log('✅ Firebase Auth user created:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists in Auth, fetching...');
        userRecord = await auth.getUserByEmail(email);
        console.log('✅ Found existing user:', userRecord.uid);
      } else {
        throw error;
      }
    }

    // Create user document in Firestore with admin role
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: displayName || 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('users').doc(userRecord.uid).set(userData, { merge: true });
    console.log('✅ User document created in Firestore');

    // Set custom claim for admin role
    await auth.setCustomUserClaims(userRecord.uid, { admin: true, role: 'admin' });
    console.log('✅ Admin custom claims set');

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📧 Email:', email);
    console.log('🆔 UID:', userRecord.uid);
    console.log('👤 Name:', displayName || 'Admin User');
    console.log('\n🔐 You can now login at: https://pja3d-fire.web.app/admin\n');

    rl.close();
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdminUser();
