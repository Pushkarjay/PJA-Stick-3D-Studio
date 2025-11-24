#!/usr/bin/env node

/**
 * Quick script to create an admin user
 * Usage: node create-admin-quick.js <email> <password> <displayName>
 */

const admin = require('firebase-admin');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('\n❌ Usage: node create-admin-quick.js <email> <password> [displayName]\n');
  console.log('Example: node create-admin-quick.js admin@pja3d.com myPassword123 "Admin User"\n');
  process.exit(1);
}

const [email, password, displayName = 'Admin User'] = args;

// Initialize Firebase Admin
const projectId = 'pja3d-fire';
admin.initializeApp({ projectId });

const db = admin.firestore();
const auth = admin.auth();

async function createAdminUser() {
  console.log('\n🔐 Creating Admin User\n');
  console.log('📧 Email:', email);
  console.log('👤 Name:', displayName);
  console.log('');

  try {
    // Create Firebase Auth user
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: displayName,
        emailVerified: true,
      });
      console.log('✅ Firebase Auth user created:', userRecord.uid);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists in Auth, fetching...');
        userRecord = await auth.getUserByEmail(email);
        console.log('✅ Found existing user:', userRecord.uid);
        
        // Update password for existing user
        await auth.updateUser(userRecord.uid, { password: password });
        console.log('✅ Password updated');
      } else {
        throw error;
      }
    }

    // Create/update user document in Firestore with admin role
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: displayName,
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

    console.log('\n✅ Admin user ready!\n');
    console.log('📧 Email:', email);
    console.log('🆔 UID:', userRecord.uid);
    console.log('👤 Name:', displayName);
    console.log('\n🔐 Login at: https://pja3d-fire.web.app/admin\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

createAdminUser();
