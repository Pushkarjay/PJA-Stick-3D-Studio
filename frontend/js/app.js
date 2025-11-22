// Enhanced E-commerce Features for PJA Stick & 3D Studio
// Inspired by Stick It Up website functionality

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : '/api';

// Global State
let cart = JSON.parse(localStorage.getItem('pjaCart')) || [];
let products = [];
let currentCategory = 'All';

// Initialize Application
async function initializeApp() {
  await loadProducts();
  updateCartBadge();
  setupEventListeners();
  renderSocialProofBanner();
  renderTestimonials();
  setupNewsletterForm();
}

// Load Products from Backend
async function loadProducts() {
  try {
    showLoadingSkeletons();
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to load products');
    
    const result = await response.json();
    // API returns: {success: true, data: {products: [...], pagination: {...}}}
    products = result.data?.products || result.data || [];
    localStorage.setItem('pjaCachedProducts', JSON.stringify(products));
    
    hideLoadingSkeletons();
    renderProducts();
  } catch (error) {
    console.error('Error loading products:', error);
    hideLoadingSkeletons();
    
    // Fallback to cached products
    const cachedProducts = localStorage.getItem('pjaCachedProducts');
    if (cachedProducts) {
      products = JSON.parse(cachedProducts);
      renderProducts();
    } else {
      showError('Unable to load products. Please refresh the page.');
    }
  }
}

// Render Products with Enhanced Features
function renderProducts() {
  const trendingProducts = products.filter(p => p.trending);
  const featuredProducts = products.filter(p => p.featured);
  
  renderProductSection('trending', 'TOP PICKS', 'Trending items loved by our customers', trendingProducts);
  renderProductSection('featured', 'BEST SELLERS', 'Most popular products this month', featuredProducts);
  renderAllProducts();
}

// Render Product Section (TOP PICKS / BEST SELLERS)
function renderProductSection(id, title, subtitle, productList) {
  const section = document.getElementById(id + 'Section');
  if (!section) return;
  
  const html = `
    <div class="section-header" style="text-align: center; margin-bottom: 2rem;">
      <span class="section-badge">${title}</span>
      <h2 class="section-title-enhanced">${title}</h2>
      <p class="section-subtitle">${subtitle}</p>
    </div>
    <div class="products-row">
      ${productList.map(product => createProductCard(product)).join('')}
    </div>
  `;
  
  section.innerHTML = html;
}

// Render All Products
function renderAllProducts() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  
  const filteredProducts = currentCategory === 'All' 
    ? products 
    : products.filter(p => p.category === currentCategory);
  
  if (filteredProducts.length === 0) {
    document.getElementById('emptyState').style.display = 'block';
    grid.style.display = 'none';
    return;
  }
  
  document.getElementById('emptyState').style.display = 'none';
  grid.style.display = 'grid';
  grid.innerHTML = filteredProducts.map(product => createProductCard(product)).join('');
  
  document.getElementById('itemCount').textContent = `${filteredProducts.length} Items`;
  document.getElementById('sectionTitle').textContent = 
    currentCategory === 'All' ? 'All Products' : currentCategory;
}

// Create Enhanced Product Card
function createProductCard(product) {
  const hasDiscount = product.discount > 0;
  const displayPrice = product.salePrice || product.price;
  const stockStatus = getStockStatus(product.stock);
  
  return `
    <div class="product-card" onclick="openProductModal('${product.id}')">
      <div class="product-image-wrapper">
        ${hasDiscount ? `
          <div class="sale-badge">
            <span class="sale-badge-text">Save</span>
            <span class="sale-badge-amount">₹${product.originalPrice - displayPrice}</span>
          </div>
        ` : ''}
        
        ${product.trending ? `
          <div class="trending-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            TRENDING
          </div>
        ` : ''}
        
        ${product.images && product.images[0] ? `
          <img src="${product.images[0]}" alt="${product.name}" class="product-img-main">
          ${product.hoverImage ? `
            <img src="${product.hoverImage}" alt="${product.name}" class="product-img-hover">
          ` : ''}
        ` : `
          <div class="product-img-placeholder">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <circle cx="9" cy="9" r="2"></circle>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path>
            </svg>
          </div>
        `}
        
        <button class="quick-view-btn" onclick="event.stopPropagation(); openProductModal('${product.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Quick View
        </button>
      </div>
      
      <div class="product-content">
        <span class="product-category">${product.category}</span>
        
        ${product.rating > 0 ? `
          <div class="product-rating">
            <div class="stars">
              ${generateStars(product.rating)}
            </div>
            <span class="rating-text">${product.rating.toFixed(2)}</span>
            <span class="review-count">(${product.reviewCount} reviews)</span>
          </div>
        ` : ''}
        
        <h3 class="product-name">${product.name}</h3>
        
        <div class="product-price-container">
          <span class="product-price">₹${displayPrice}</span>
          ${hasDiscount ? `
            <span class="product-original-price">₹${product.originalPrice}</span>
            <span class="product-discount">-${product.discount}%</span>
          ` : ''}
        </div>
        
        <p class="product-description">${product.description}</p>
        
        ${stockStatus.badge}
        
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  `;
}

// Generate Star Rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  
  let html = '';
  
  for (let i = 0; i < fullStars; i++) {
    html += `
      <svg class="star" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
      </svg>
    `;
  }
  
  if (hasHalfStar) {
    html += `
      <svg class="star" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" opacity="0.5"></path>
      </svg>
    `;
  }
  
  for (let i = 0; i < emptyStars; i++) {
    html += `
      <svg class="star empty" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
      </svg>
    `;
  }
  
  return html;
}

// Get Stock Status
function getStockStatus(stock) {
  if (stock === 0) {
    return {
      badge: '<span class="stock-badge out-of-stock">Out of Stock</span>',
      available: false
    };
  } else if (stock <= 5) {
    return {
      badge: `<span class="stock-badge low-stock">Only ${stock} left!</span>`,
      available: true
    };
  } else {
    return {
      badge: '<span class="stock-badge in-stock">In Stock</span>',
      available: true
    };
  }
}

// Shopping Cart Functions
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const stockStatus = getStockStatus(product.stock);
  if (!stockStatus.available) {
    showToast('Sorry, this product is out of stock', 'error');
    return;
  }
  
  const existingItem = cart.find(item => item.id === productId);
  
  if (existingItem) {
    if (existingItem.quantity >= product.stock) {
      showToast('Cannot add more. Stock limit reached', 'warning');
      return;
    }
    existingItem.quantity += 1;
  } else {
    const displayPrice = product.salePrice || product.price;
    cart.push({
      id: product.id,
      name: product.name,
      price: displayPrice,
      originalPrice: product.originalPrice,
      category: product.category,
      image: product.images?.[0] || '',
      quantity: 1,
      stock: product.stock
    });
  }
  
  saveCart();
  updateCartBadge();
  updateCartDisplay();
  showToast(`${product.name} added to cart!`, 'success');
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartBadge();
  updateCartDisplay();
}

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);
  if (!item) return;
  
  item.quantity += change;
  
  if (item.quantity <= 0) {
    removeFromCart(productId);
  } else if (item.quantity > item.stock) {
    item.quantity = item.stock;
    showToast('Stock limit reached', 'warning');
  } else {
    saveCart();
    updateCartDisplay();
  }
}

function saveCart() {
  localStorage.setItem('pjaCart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (totalItems > 0) {
    badge.textContent = totalItems;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

function updateCartDisplay() {
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');
  const emptyCart = document.getElementById('emptyCart');
  
  if (!cartItems) return;
  
  if (cart.length === 0) {
    if (emptyCart) emptyCart.style.display = 'block';
    cartItems.innerHTML = '';
    if (cartTotal) cartTotal.textContent = '₹0';
    return;
  }
  
  if (emptyCart) emptyCart.style.display = 'none';
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  cartItems.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        ${item.image ? `
          <img src="${item.image}" alt="${item.name}">
        ` : `
          <div style="width: 100%; height: 100%; background: #f1f5f9; display: flex; align-items: center; justify-content: center;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            </svg>
          </div>
        `}
      </div>
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <p class="cart-item-category">${item.category}</p>
        <p class="cart-item-price">₹${item.price}</p>
      </div>
      <div class="cart-item-controls">
        <div class="quantity-controls">
          <button onclick="updateQuantity('${item.id}', -1)" class="quantity-btn">-</button>
          <span class="quantity">${item.quantity}</span>
          <button onclick="updateQuantity('${item.id}', 1)" class="quantity-btn">+</button>
        </div>
        <button onclick="removeFromCart('${item.id}')" class="remove-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  `).join('');
  
  if (cartTotal) cartTotal.textContent = `₹${total}`;
}

// Social Proof Banner
function renderSocialProofBanner() {
  const bannerContainer = document.getElementById('socialProofBanner');
  if (!bannerContainer) return;
  
  const proofItems = [
    { icon: 'users', text: '5,000+ Happy Customers' },
    { icon: 'india', text: 'Made in Daltonganj' },
    { icon: 'clock', text: 'Same Day Delivery' },
    { icon: 'shield', text: 'Quality Guaranteed' },
    { icon: 'users', text: '5,000+ Happy Customers' },
    { icon: 'india', text: 'Made in Daltonganj' },
    { icon: 'clock', text: 'Same Day Delivery' },
    { icon: 'shield', text: 'Quality Guaranteed' }
  ];
  
  const html = `
    <div class="social-proof-ticker">
      ${proofItems.map(item => `
        <span class="social-proof-item">
          ${getSocialProofIcon(item.icon)}
          ${item.text}
        </span>
        <span class="social-proof-separator">•</span>
      `).join('')}
    </div>
  `;
  
  bannerContainer.innerHTML = html;
}

function getSocialProofIcon(type) {
  const icons = {
    users: '<svg class="social-proof-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    india: '<svg class="social-proof-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    clock: '<svg class="social-proof-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    shield: '<svg class="social-proof-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
  };
  return icons[type] || icons.users;
}

// Testimonials
function renderTestimonials() {
  const testimonialsContainer = document.getElementById('testimonials');
  if (!testimonialsContainer) return;
  
  const testimonials = [
    {
      name: "Rahul Kumar",
      role: "College Student",
      avatar: "RK",
      rating: 5,
      text: "Got my flip name printed and it's absolutely amazing! The quality is top-notch and the team was very helpful."
    },
    {
      name: "Priya Singh",
      role: "Teacher",
      avatar: "PS",
      rating: 5,
      text: "Best printing shop in Daltonganj! Fast service, great prices, and excellent quality. Highly recommended!"
    },
    {
      name: "Amit Sharma",
      role: "Business Owner",
      avatar: "AS",
      rating: 5,
      text: "The laptop skins are amazing! Waterproof and looks premium. Got anime stickers too, love them all!"
    }
  ];
  
  const html = `
    <div class="section-header" style="text-align: center; margin-bottom: 2rem;">
      <span class="section-badge">Testimonials</span>
      <h2 class="section-title-enhanced">What Our Customers Say</h2>
      <p class="section-subtitle">Real reviews from real customers</p>
    </div>
    <div class="testimonials-grid">
      ${testimonials.map(t => `
        <div class="testimonial-card">
          <div class="testimonial-stars">
            ${generateStars(t.rating)}
          </div>
          <p class="testimonial-text">"${t.text}"</p>
          <div class="testimonial-header">
            <div class="testimonial-avatar">${t.avatar}</div>
            <div class="testimonial-info">
              <h4>${t.name}</h4>
              <p>${t.role}</p>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  testimonialsContainer.innerHTML = html;
}

// Newsletter Form
function setupNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    
    try {
      // TODO: Send to backend API
      console.log('Newsletter signup:', email);
      showToast('Thank you for subscribing!', 'success');
      form.reset();
    } catch (error) {
      showToast('Failed to subscribe. Please try again.', 'error');
    }
  });
}

// Loading Skeletons
function showLoadingSkeletons() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;
  
  grid.innerHTML = Array(8).fill().map(() => `
    <div class="product-skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line"></div>
      </div>
    </div>
  `).join('');
}

function hideLoadingSkeletons() {
  // Skeletons will be replaced by actual products
}

// Toast Notification
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) {
    console.log(message);
    return;
  }
  
  const toastTitle = toast.querySelector('.toast-title');
  const toastMessage = toast.querySelector('.toast-message');
  
  if (toastTitle) toastTitle.textContent = type === 'success' ? 'Success!' : type === 'error' ? 'Error!' : 'Notice';
  if (toastMessage) toastMessage.textContent = message;
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

function showError(message) {
  showToast(message, 'error');
}

// Open Product Modal
function openProductModal(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;
  
  const modal = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  
  if (!modal || !modalBody) return;
  
  const displayPrice = product.salePrice || product.price;
  const hasDiscount = product.discount > 0;
  
  modalBody.innerHTML = `
    <div class="modal-image">
      ${product.images && product.images[0] ? `
        <img src="${product.images[0]}" alt="${product.name}" class="modal-product-img">
      ` : `
        <div class="modal-img-placeholder">No Image Available</div>
      `}
    </div>
    <div class="modal-details">
      <span class="modal-category">${product.category}</span>
      <h2 class="modal-title">${product.name}</h2>
      
      ${product.rating > 0 ? `
        <div class="product-rating" style="margin-bottom: 1rem;">
          <div class="stars">${generateStars(product.rating)}</div>
          <span class="rating-text">${product.rating.toFixed(2)}</span>
          <span class="review-count">(${product.reviewCount} reviews)</span>
        </div>
      ` : ''}
      
      <div class="product-price-container" style="margin-bottom: 1.5rem;">
        <span class="product-price" style="font-size: 1.875rem;">₹${displayPrice}</span>
        ${hasDiscount ? `
          <span class="product-original-price" style="font-size: 1.125rem;">₹${product.originalPrice}</span>
          <span class="product-discount">-${product.discount}%</span>
        ` : ''}
      </div>
      
      <p class="modal-description">${product.description}</p>
      
      ${product.specifications ? `
        <div class="modal-specs">
          ${Object.entries(product.specifications).map(([key, value]) => `
            <div class="spec-box">
              <span class="spec-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span class="spec-value">${value}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      <button class="modal-cta" onclick="addToCart('${product.id}'); closeModal();">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        Add to Cart - ₹${displayPrice}
      </button>
      
      <p class="modal-note">or continue shopping to add more items</p>
    </div>
  `;
  
  modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('modalOverlay');
  if (modal) modal.classList.remove('open');
}

// Event Listeners Setup
function setupEventListeners() {
  // Category filter buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.category;
      renderAllProducts();
    });
  });
  
  // Mobile menu toggle
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }
  
  // Cart button
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', toggleCart);
  }
  
  // Modal close
  const modalClose = document.getElementById('modalClose');
  const modalOverlay = document.getElementById('modalOverlay');
  
  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }
  
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  
  // Initial cart display
  updateCartDisplay();
}

// Cart Sidebar Toggle
function toggleCart() {
  const cartSidebar = document.getElementById('cartSidebar');
  if (cartSidebar) {
    cartSidebar.classList.toggle('open');
  }
}

// Checkout Function
function checkout() {
  if (cart.length === 0) {
    showToast('Your cart is empty', 'warning');
    return;
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let message = `*New Order from PJA Stick & 3D Studio*%0A%0A`;
  message += `*Items:*%0A`;
  
  cart.forEach(item => {
    message += `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}%0A`;
  });
  
  message += `%0A*Total: ₹${total}*%0A%0A`;
  message += `Payment Method: Cash/UPI on Delivery`;
  
  const whatsappUrl = `https://wa.me/916372362313?text=${message}`;
  window.open(whatsappUrl, '_blank');
  
  showToast('Redirecting to WhatsApp...', 'success');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
