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
          ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-img">` : '<div class="product-img-placeholder">No Image</div>'}
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
      ${selectedProduct.imageUrl ? `<img src="${selectedProduct.imageUrl}" alt="${selectedProduct.name}" class="modal-product-img">` : '<div class="modal-img-placeholder">No Image</div>'}
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
