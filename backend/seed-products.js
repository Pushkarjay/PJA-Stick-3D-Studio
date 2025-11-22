// Seed Products to Firestore
// Run this once to populate your database with initial products

const admin = require('firebase-admin');
const serviceAccount = require('./config/pja3d-fire-firebase-adminsdk-fbsvc-96219dabc7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pja3d-fire.appspot.com'
});

const db = admin.firestore();

const products = [
  {
    id: 'prod_001',
    name: "3D Flip Name Illusion",
    category: "3D Print",
    subCategory: "Trending",
    description: "The viral 3D gift! Shows one name from the left and another from the right. Perfect for couples.",
    price: 499,
    originalPrice: 699,
    salePrice: 499,
    discount: 29,
    stock: 10,
    trending: true,
    featured: true,
    images: [],
    hoverImage: null,
    rating: 4.9,
    reviewCount: 247,
    specifications: {
      material: "PLA (Dual Color)",
      time: "5-7 Hours",
      difficulty: "Complex"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_002',
    name: "Moon Lamp (Custom)",
    category: "3D Print",
    subCategory: "Decor",
    description: "A textured moon that glows. Can include a hidden photo (lithophane) or text on the surface.",
    price: 899,
    originalPrice: 1299,
    salePrice: 899,
    discount: 31,
    stock: 5,
    trending: true,
    featured: true,
    images: [],
    hoverImage: null,
    rating: 4.95,
    reviewCount: 189,
    specifications: {
      material: "White PLA",
      time: "12+ Hours",
      difficulty: "Complex"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_003',
    name: "Divine 3D Idol (Gold)",
    category: "3D Print",
    subCategory: "Spiritual",
    description: "Beautifully detailed spiritual idols in premium gold finish. Available: Hanuman Ji, Ganesh Ji, Krishna Ji.",
    price: 399,
    originalPrice: 599,
    salePrice: 399,
    discount: 33,
    stock: 15,
    trending: true,
    featured: false,
    images: [],
    hoverImage: null,
    rating: 4.88,
    reviewCount: 156,
    specifications: {
      material: "Gold PLA",
      time: "6-8 Hours",
      difficulty: "Moderate"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_004',
    name: "Custom Lithophane Frame",
    category: "3D Print",
    subCategory: "Sentimental",
    description: "Turn your favorite memory into a glowing masterpiece. Looks like a relief carving until backlit.",
    price: 599,
    originalPrice: 899,
    salePrice: 599,
    discount: 33,
    stock: 8,
    trending: false,
    featured: true,
    images: [],
    hoverImage: null,
    rating: 4.92,
    reviewCount: 134,
    specifications: {
      material: "White PLA",
      time: "4-6 Hours",
      difficulty: "Moderate"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_005',
    name: "Laptop Skin (Full Body)",
    category: "Stickers",
    subCategory: "Tech",
    description: "Waterproof vinyl skins for laptops. Custom designs, anime characters, or your own artwork.",
    price: 299,
    originalPrice: 499,
    salePrice: 299,
    discount: 40,
    stock: 50,
    trending: true,
    featured: false,
    images: [],
    hoverImage: null,
    rating: 4.75,
    reviewCount: 312,
    specifications: {
      material: "Premium Vinyl",
      time: "Same Day",
      difficulty: "Easy"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_006',
    name: "Mobile Skin Set",
    category: "Stickers",
    subCategory: "Tech",
    description: "Precision-cut skins for all popular mobile models. Matte or glossy finish available.",
    price: 149,
    originalPrice: 249,
    salePrice: 149,
    discount: 40,
    stock: 100,
    trending: false,
    featured: false,
    images: [],
    hoverImage: null,
    rating: 4.68,
    reviewCount: 278,
    specifications: {
      material: "Premium Vinyl",
      time: "Same Day",
      difficulty: "Easy"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_007',
    name: "Document Printing (B&W)",
    category: "Printing",
    subCategory: "Academic",
    description: "High-quality black and white printing for assignments, notes, and study materials.",
    price: 2,
    originalPrice: null,
    salePrice: null,
    discount: 0,
    stock: 10000,
    trending: false,
    featured: false,
    images: [],
    hoverImage: null,
    rating: 4.82,
    reviewCount: 1547,
    specifications: {
      material: "A4 Paper",
      time: "Instant",
      difficulty: "Easy"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_008',
    name: "Document Printing (Color)",
    category: "Printing",
    subCategory: "Academic",
    description: "Vibrant color prints for presentations, posters, and colorful assignments.",
    price: 5,
    originalPrice: null,
    salePrice: null,
    discount: 0,
    stock: 5000,
    trending: false,
    featured: false,
    images: [],
    hoverImage: null,
    rating: 4.79,
    reviewCount: 892,
    specifications: {
      material: "A4 Paper",
      time: "Instant",
      difficulty: "Easy"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_009',
    name: "Project Report Binding",
    category: "Printing",
    subCategory: "Academic",
    description: "Professional spiral or thermal binding for your college project reports.",
    price: 50,
    originalPrice: 75,
    salePrice: 50,
    discount: 33,
    stock: 200,
    trending: true,
    featured: false,
    images: [],
    hoverImage: null,
    rating: 4.91,
    reviewCount: 456,
    specifications: {
      material: "Binding Wire/Thermal",
      time: "15 minutes",
      difficulty: "Easy"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  },
  {
    id: 'prod_010',
    name: "Anime Sticker Pack",
    category: "Stickers",
    subCategory: "Anime",
    description: "Premium waterproof stickers featuring popular anime characters. Pack of 10 designs.",
    price: 99,
    originalPrice: 149,
    salePrice: 99,
    discount: 34,
    stock: 75,
    trending: true,
    featured: true,
    images: [],
    hoverImage: null,
    rating: 4.86,
    reviewCount: 621,
    specifications: {
      material: "Waterproof Vinyl",
      time: "Same Day",
      difficulty: "Easy"
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active'
  }
];

async function seedProducts() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const batch = db.batch();
    
    products.forEach(product => {
      const productRef = db.collection('products').doc(product.id);
      batch.set(productRef, product);
    });
    
    await batch.commit();
    console.log(`✅ Successfully added ${products.length} products to Firestore!`);
    console.log('\nProducts added:');
    products.forEach(p => console.log(`- ${p.name} (₹${p.price})`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedProducts();
