// Load products from localStorage if available (updated by admin), otherwise use default
function loadProductsData() {
  const savedProducts = localStorage.getItem('pjaProductsPublic');
  if (savedProducts) {
    return JSON.parse(savedProducts);
  }
  return defaultProducts;
}

// Default Products Data
const defaultProducts = [
  {
    id: 101,
    name: "3D Flip Name Illusion",
    category: "3D Print",
    subCategory: "Trending",
    difficulty: "Complex",
    time: "5-7 Hours",
    material: "PLA (Dual Color)",
    description: "The viral 3D gift! Shows one name from the left and another from the right. Perfect for couples.",
    price: "Medium",
    trending: true
  },
  {
    id: 102,
    name: "Moon Lamp (Custom)",
    category: "3D Print",
    subCategory: "Decor",
    difficulty: "Complex",
    time: "12+ Hours",
    material: "White PLA",
    description: "A textured moon that glows. Can include a hidden photo (lithophane) or text on the surface.",
    price: "High",
    trending: true
  },
  {
    id: 1,
    name: "Custom Lithophane Frame",
    category: "3D Print",
    subCategory: "Sentimental",
    difficulty: "Moderate",
    time: "4-6 Hours",
    material: "White PLA",
    description: "Turn your favorite memory into a glowing masterpiece. Looks like a relief carving until backlit.",
    price: "Custom"
  },
  {
    id: 103,
    name: "Divine 3D Idol (Gold)",
    category: "3D Print",
    subCategory: "Spiritual",
    difficulty: "Moderate",
    time: "6-8 Hours",
    material: "Silk Gold PLA",
    description: "Premium finished idols for home mandirs or car dashboards. Inspired by the 'Divine Collection'.",
    price: "Medium"
  },
  {
    id: 2,
    name: "Laptop Skin / Decals",
    category: "Stickers",
    subCategory: "Stickers",
    difficulty: "Easy",
    time: "Instant",
    material: "Vinyl (Waterproof)",
    description: "Premium waterproof skins for laptops and mobiles. Anime, Devotional, or Custom designs available.",
    price: "Low"
  },
  {
    id: 104,
    name: "Couple Date Plank",
    category: "3D Print",
    subCategory: "Sentimental",
    difficulty: "Easy",
    time: "2-3 Hours",
    material: "PLA (Red/White)",
    description: "Minimalist text stand showing your special date and names. Great budget anniversary gift.",
    price: "Low"
  },
  {
    id: 3,
    name: "Project Report Printing",
    category: "Printing",
    subCategory: "Documents",
    difficulty: "Easy",
    time: "Fast",
    material: "A4 Bond Paper",
    description: "High-quality Black & White or Color printing for college assignments, reports, and projects.",
    price: "Low"
  },
  {
    id: 4,
    name: "Low-Poly Pikachu",
    category: "3D Print",
    subCategory: "Anime",
    difficulty: "Easy",
    time: "2-3 Hours",
    material: "Yellow PLA",
    description: "A cute, geometric style Pikachu perfect for desk setups.",
    price: "Medium"
  },
  {
    id: 5,
    name: "Spiral Geometric Vase",
    category: "3D Print",
    subCategory: "Decor",
    difficulty: "Easy",
    time: "3-5 Hours",
    material: "Silk PLA",
    description: "Printed in 'Vase Mode' for a seamless, elegant finish.",
    price: "Medium"
  },
  {
    id: 6,
    name: "Naruto Chibi Figure",
    category: "3D Print",
    subCategory: "Anime",
    difficulty: "Complex",
    time: "6-8 Hours",
    material: "Grey PLA",
    description: "Detailed miniature of Naruto. Great for painting.",
    price: "High"
  },
  {
    id: 7,
    name: "Custom Name Plate",
    category: "3D Print",
    subCategory: "Sentimental",
    difficulty: "Easy",
    time: "1-2 Hours",
    material: "Dual Color PLA",
    description: "Personalized name tags for desks, doors, or keychains.",
    price: "Low"
  },
  {
    id: 8,
    name: "Controller Stand",
    category: "3D Print",
    subCategory: "Useful",
    difficulty: "Moderate",
    time: "4-5 Hours",
    material: "PLA",
    description: "Display your Xbox or PS5 controllers in style.",
    price: "Medium"
  }
];

// Load products (from admin updates or defaults)
let products = loadProductsData();

// SVG Icons
const svgIcons = {
  lithophane: `<svg viewBox="0 0 100 100" class="product-svg">
    <rect x="20" y="15" width="60" height="70" rx="4" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2" />
    <rect x="25" y="20" width="50" height="45" rx="2" fill="#e5e7eb" />
    <circle cx="40" cy="35" r="8" fill="#d1d5db" />
    <path d="M25 65 L40 45 L55 60 L65 50 L75 65 Z" fill="#9ca3af" />
    <rect x="25" y="70" width="50" height="4" rx="2" fill="#cbd5e1" />
    <path d="M20 15 L10 90 L90 90 L80 15 Z" fill="url(#lightGrad)" opacity="0.2" />
    <defs>
      <linearGradient id="lightGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#fbbf24" stop-opacity="0"/>
      </linearGradient>
    </defs>
  </svg>`,

  flipName: `<svg viewBox="0 0 100 100" class="product-svg">
    <path d="M20 70 L80 70 L90 80 L10 80 Z" fill="#334155" />
    <path d="M25 65 L25 35 L35 30 L35 60" fill="#ef4444" opacity="0.9" /> 
    <path d="M40 65 L40 35 L50 30 L50 60" fill="#ef4444" opacity="0.9" />
    <path d="M35 60 L55 60 L60 40 L40 40" fill="#3b82f6" opacity="0.8" />
    <text x="50" y="25" font-size="8" text-anchor="middle" fill="#64748b">FLIP ME</text>
    <path d="M45 15 Q50 10 55 15" stroke="#64748b" stroke-width="1" fill="none" marker-end="url(#arrow)" />
  </svg>`,

  moonLamp: `<svg viewBox="0 0 100 100" class="product-svg">
    <path d="M30 80 L40 60 L60 60 L70 80" fill="none" stroke="#9ca3af" stroke-width="3" />
    <circle cx="50" cy="45" r="30" fill="#fef3c7" />
    <circle cx="40" cy="35" r="4" fill="#fde68a" opacity="0.6" />
    <circle cx="60" cy="50" r="6" fill="#fde68a" opacity="0.6" />
    <circle cx="45" cy="60" r="3" fill="#fde68a" opacity="0.6" />
    <circle cx="50" cy="45" r="35" fill="url(#moonGlow)" opacity="0.3" />
    <defs>
      <radialGradient id="moonGlow">
        <stop offset="0%" stop-color="#fffbeb" />
        <stop offset="100%" stop-color="#fffbeb" stop-opacity="0" />
      </radialGradient>
    </defs>
  </svg>`,

  idol: `<svg viewBox="0 0 100 100" class="product-svg">
    <circle cx="50" cy="40" r="25" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4 2" fill="none" />
    <path d="M50 25 C60 25 65 35 65 50 C65 70 80 80 80 85 L20 85 C20 80 35 70 35 50 C35 35 40 25 50 25" fill="#f59e0b" />
    <rect x="15" y="85" width="70" height="5" fill="#78350f" />
  </svg>`,

  pikachu: `<svg viewBox="0 0 100 100" class="product-svg">
    <path d="M20 60 L30 50 L25 40 L40 30 L35 20 L60 30" stroke="#ca8a04" stroke-width="4" fill="none" />
    <circle cx="50" cy="60" r="25" fill="#facc15" />
    <ellipse cx="35" cy="35" rx="5" ry="15" transform="rotate(-30 35 35)" fill="#facc15" />
    <ellipse cx="35" cy="25" rx="5" ry="5" transform="rotate(-30 35 35)" fill="#000" />
    <ellipse cx="65" cy="35" rx="5" ry="15" transform="rotate(30 65 35)" fill="#facc15" />
    <ellipse cx="65" cy="25" rx="5" ry="5" transform="rotate(30 65 35)" fill="#000" />
    <circle cx="42" cy="55" r="2" fill="#000" />
    <circle cx="58" cy="55" r="2" fill="#000" />
    <circle cx="38" cy="62" r="3" fill="#ef4444" />
    <circle cx="62" cy="62" r="3" fill="#ef4444" />
    <path d="M47 60 Q50 63 53 60" stroke="#000" stroke-width="1" fill="none" />
  </svg>`,

  naruto: `<svg viewBox="0 0 100 100" class="product-svg">
    <path d="M30 40 L25 25 L40 35 L50 20 L60 35 L75 25 L70 40 Z" fill="#facc15" stroke="#ca8a04" stroke-width="1"/>
    <rect x="28" y="38" width="44" height="10" rx="2" fill="#1e293b" />
    <rect x="40" y="40" width="20" height="6" rx="1" fill="#94a3b8" />
    <circle cx="50" cy="43" r="2" stroke="#475569" stroke-width="1" fill="none" />
    <path d="M48 43 L52 43" stroke="#475569" stroke-width="1" />
    <circle cx="50" cy="55" r="18" fill="#fdba74" />
    <path d="M38 52 L42 54 M38 56 L42 58 M38 60 L42 62" stroke="#000" opacity="0.5" />
    <path d="M62 52 L58 54 M62 56 L58 58 M62 60 L58 62" stroke="#000" opacity="0.5" />
  </svg>`,

  vase: `<svg viewBox="0 0 100 100" class="product-svg">
    <path d="M40 80 L30 30 L40 20 L60 20 L70 30 L60 80 Z" fill="#2dd4bf" opacity="0.8" />
    <path d="M40 80 L45 50 L60 80 Z" fill="#14b8a6" opacity="0.6" />
    <path d="M30 30 L45 50 L70 30" fill="none" stroke="#ccfbf1" stroke-width="1" />
    <ellipse cx="50" cy="20" rx="10" ry="3" fill="#0f766e" />
  </svg>`,

  controllerStand: `<svg viewBox="0 0 100 100" class="product-svg">
    <path d="M30 60 L30 40 L70 40 L70 60 L60 70 L40 70 Z" fill="#6366f1" />
    <circle cx="40" cy="50" r="5" fill="#e0e7ff" />
    <circle cx="60" cy="50" r="5" fill="#e0e7ff" />
    <rect x="40" y="70" width="20" height="10" fill="#4338ca" />
  </svg>`,

  namePlate: `<svg viewBox="0 0 100 100" class="product-svg">
    <rect x="15" y="35" width="70" height="30" rx="4" fill="#f472b6" />
    <rect x="20" y="40" width="60" height="20" rx="2" fill="#fbcfe8" />
    <text x="50" y="55" font-size="10" text-anchor="middle" fill="#be185d" font-family="sans-serif" font-weight="bold">NAME</text>
  </svg>`,

  sticker: `<svg viewBox="0 0 100 100" class="product-svg">
    <path d="M30 30 L70 30 L70 70 L60 80 L30 80 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
    <path d="M70 70 L60 70 L60 80" fill="#cbd5e1" />
    <circle cx="50" cy="50" r="15" fill="#f43f5e" opacity="0.8" />
    <path d="M45 45 L55 55 M55 45 L45 55" stroke="#fff" stroke-width="3" />
    <text x="50" y="75" font-size="8" text-anchor="middle" fill="#64748b">STICKY</text>
  </svg>`,

  document: `<svg viewBox="0 0 100 100" class="product-svg">
    <rect x="30" y="20" width="40" height="60" fill="#fff" stroke="#94a3b8" stroke-width="2" />
    <line x1="35" y1="30" x2="65" y2="30" stroke="#cbd5e1" stroke-width="2" />
    <line x1="35" y1="40" x2="65" y2="40" stroke="#cbd5e1" stroke-width="2" />
    <line x1="35" y1="50" x2="55" y2="50" stroke="#cbd5e1" stroke-width="2" />
    <rect x="55" y="60" width="20" height="20" fill="#22c55e" rx="2" />
    <path d="M65 65 L65 75 M60 70 L70 70" stroke="#fff" stroke-width="2" />
  </svg>`,

  datePlank: `<svg viewBox="0 0 100 100" class="product-svg">
    <rect x="15" y="60" width="70" height="15" fill="#e2e8f0" rx="2" />
    <text x="50" y="71" font-size="8" text-anchor="middle" fill="#475569" font-family="monospace">12.05.2025</text>
    <path d="M25 60 L25 30 Q35 20 45 30 L50 35 L55 30 Q65 20 75 30 L75 60" fill="#f43f5e" opacity="0.8" />
  </svg>`
};

// Get icon based on product ID
function getProductIcon(product) {
  const iconMap = {
    101: 'flipName',
    102: 'moonLamp',
    1: 'lithophane',
    103: 'idol',
    2: 'sticker',
    104: 'datePlank',
    3: 'document',
    4: 'pikachu',
    5: 'vase',
    6: 'naruto',
    7: 'namePlate',
    8: 'controllerStand'
  };
  return svgIcons[iconMap[product.id]] || svgIcons.document;
}

// State
let activeCategory = 'All';
let selectedProduct = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Reload products from localStorage if updated
  products = loadProductsData();
  renderProducts();
  setupEventListeners();
});

// Reload products when page gets focus (in case admin updated them)
window.addEventListener('storage', function(e) {
  if (e.key === 'pjaProductsPublic') {
    products = loadProductsData();
    renderProducts();
  }
});

// Setup Event Listeners
function setupEventListeners() {
  // Navigation buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const category = this.getAttribute('data-category');
      filterProducts(category);
    });
  });

  // Hamburger menu
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
    });
  }

  // Modal close
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }
  
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
}

// Filter Products
function filterProducts(category) {
  activeCategory = category;
  
  // Update active button state
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    if (btn.getAttribute('data-category') === category) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Close mobile menu
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    mobileMenu.classList.remove('open');
  }
  
  renderProducts();
}

// Render Products
function renderProducts() {
  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);
  
  const productGrid = document.getElementById('productGrid');
  const emptyState = document.getElementById('emptyState');
  const itemCount = document.getElementById('itemCount');
  const sectionTitle = document.getElementById('sectionTitle');
  
  // Update section title
  sectionTitle.textContent = activeCategory === 'All' ? 'Featured Collection' : `${activeCategory} Collection`;
  
  // Update item count
  itemCount.textContent = `${filteredProducts.length} Items`;
  
  if (filteredProducts.length === 0) {
    productGrid.style.display = 'none';
    emptyState.style.display = 'block';
  } else {
    productGrid.style.display = 'grid';
    emptyState.style.display = 'none';
    
    productGrid.innerHTML = filteredProducts.map(product => `
      <div class="product-card" onclick="openModal(${product.id})">
        <div class="product-image">
          ${getProductIcon(product)}
          ${product.trending ? `
            <div class="trending-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
              </svg>
              HOT
            </div>
          ` : ''}
          <div class="difficulty-badge difficulty-${product.difficulty}">
            ${product.difficulty}
          </div>
        </div>
        <div class="product-content">
          <div>
            <span class="product-category">${product.subCategory}</span>
            <h4 class="product-name">${product.name}</h4>
          </div>
          <p class="product-description">${product.description}</p>
          <div class="product-footer">
            <div class="product-time">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              ${product.time}
            </div>
            <span class="product-view">
              View
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

// Open Modal
function openModal(productId) {
  selectedProduct = products.find(p => p.id === productId);
  if (!selectedProduct) return;
  
  const modalOverlay = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <div class="modal-image">
      <div class="modal-svg">
        ${getProductIcon(selectedProduct)}
      </div>
    </div>
    <div class="modal-details">
      <span class="modal-category">${selectedProduct.subCategory}</span>
      <h2 class="modal-title">${selectedProduct.name}</h2>
      <div class="modal-badges">
        <div class="difficulty-badge difficulty-${selectedProduct.difficulty}">
          ${selectedProduct.difficulty}
        </div>
      </div>
      <p class="modal-description">${selectedProduct.description}</p>
      <div class="modal-specs">
        <div class="spec-box">
          <span class="spec-label">Material</span>
          <span class="spec-value">${selectedProduct.material}</span>
        </div>
        <div class="spec-box">
          <span class="spec-label">Price</span>
          <span class="spec-value">${selectedProduct.price}</span>
        </div>
      </div>
      <button class="modal-cta" onclick="handleOrderClick()">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
        </svg>
        Request on WhatsApp
      </button>
      <p class="modal-note">Opens WhatsApp chat with PJA Studio (6372362313)</p>
    </div>
  `;
  
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// Close Modal
function closeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.classList.remove('open');
  document.body.style.overflow = 'unset';
  selectedProduct = null;
}

// Handle Order Click
function handleOrderClick() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  
  // Open WhatsApp
  window.open(
    `https://wa.me/916372362313?text=Hi, I'm interested in the ${selectedProduct.name}!`,
    '_blank'
  );
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
  
  closeModal();
}
