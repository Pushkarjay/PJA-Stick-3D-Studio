#!/usr/bin/env node

/**
 * Initialize database with default settings and dropdowns
 * Usage: node init-database.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const projectId = 'pja3d-fire';
admin.initializeApp({ projectId });

const db = admin.firestore();

async function initializeDatabase() {
  console.log('\n🔧 Initializing PJA3D Database\n');

  try {
    // Initialize Settings
    console.log('📝 Creating default settings...');
    await db.collection('settings').doc('general').set({
      siteName: 'PJA3D Prints',
      siteDescription: 'Premium 3D Printed Products',
      contactEmail: 'contact@pja3d.com',
      whatsappNumber: '916372362313',
      currency: 'INR',
      taxRate: 18,
      shippingFee: 50,
      freeShippingThreshold: 1000,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Settings created');

    // Initialize Dropdowns - Materials
    console.log('📝 Creating material options...');
    await db.collection('dropdowns').doc('materials').set({
      name: 'Materials',
      key: 'material',
      options: [
        { value: 'pla', label: 'PLA', isActive: true },
        { value: 'abs', label: 'ABS', isActive: true },
        { value: 'petg', label: 'PETG', isActive: true },
        { value: 'tpu', label: 'TPU (Flexible)', isActive: true },
        { value: 'resin', label: 'Resin', isActive: true }
      ],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Materials created');

    // Initialize Dropdowns - Colors
    console.log('📝 Creating color options...');
    await db.collection('dropdowns').doc('colors').set({
      name: 'Colors',
      key: 'color',
      options: [
        { value: 'black', label: 'Black', isActive: true },
        { value: 'white', label: 'White', isActive: true },
        { value: 'red', label: 'Red', isActive: true },
        { value: 'blue', label: 'Blue', isActive: true },
        { value: 'green', label: 'Green', isActive: true },
        { value: 'yellow', label: 'Yellow', isActive: true },
        { value: 'orange', label: 'Orange', isActive: true },
        { value: 'purple', label: 'Purple', isActive: true },
        { value: 'custom', label: 'Custom Color', isActive: true }
      ],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Colors created');

    // Initialize Dropdowns - Sizes
    console.log('📝 Creating size options...');
    await db.collection('dropdowns').doc('sizes').set({
      name: 'Sizes',
      key: 'size',
      options: [
        { value: 'small', label: 'Small (5-10cm)', isActive: true },
        { value: 'medium', label: 'Medium (10-20cm)', isActive: true },
        { value: 'large', label: 'Large (20-30cm)', isActive: true },
        { value: 'xlarge', label: 'X-Large (30cm+)', isActive: true },
        { value: 'custom', label: 'Custom Size', isActive: true }
      ],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Sizes created');

    // Initialize Dropdowns - Finishes
    console.log('📝 Creating finish options...');
    await db.collection('dropdowns').doc('finishes').set({
      name: 'Finishes',
      key: 'finish',
      options: [
        { value: 'standard', label: 'Standard (As Printed)', isActive: true },
        { value: 'sanded', label: 'Sanded Smooth', isActive: true },
        { value: 'painted', label: 'Painted', isActive: true },
        { value: 'polished', label: 'Polished', isActive: true }
      ],
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('✅ Finishes created');

    // Initialize Categories
    console.log('📝 Creating default categories...');
    const categories = [
      { name: 'Home Decor', slug: 'home-decor', description: 'Decorative items for your home' },
      { name: 'Toys & Games', slug: 'toys-games', description: 'Fun toys and game pieces' },
      { name: 'Tools & Gadgets', slug: 'tools-gadgets', description: 'Useful tools and gadgets' },
      { name: 'Art & Sculptures', slug: 'art-sculptures', description: 'Artistic sculptures and figurines' },
      { name: 'Custom Prints', slug: 'custom-prints', description: 'Custom 3D printed items' }
    ];

    for (const category of categories) {
      await db.collection('categories').add({
        ...category,
        isActive: true,
        productCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('✅ Categories created');

    console.log('\n✅ Database initialization complete!\n');
    console.log('🎉 You can now:');
    console.log('   1. Go to Admin Dashboard → Products');
    console.log('   2. Click "Add Product" to create your first product');
    console.log('   3. Manage categories, dropdowns, and settings\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }

  process.exit(0);
}

initializeDatabase();
