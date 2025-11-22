// Authentication - Hardcoded for prototype
// TODO: Implement proper authentication for production
const ADMIN_CREDENTIALS = {
  username: 'pushkarjay',
  password: 'kiitprint'
};

// Check if user is logged in
function checkAuth() {
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  if (isLoggedIn === 'true') {
    showDashboard();
  } else {
    showLogin();
  }
}

// Show login screen
function showLogin() {
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('adminDashboard').style.display = 'none';
}

// Show dashboard
function showDashboard() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('adminDashboard').style.display = 'block';
  loadProducts();
  loadCategories();
  loadSettings();
}

// Login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('loginError');

  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    sessionStorage.setItem('adminUser', username);
    showDashboard();
    showToast('Login successful!');
  } else {
    errorDiv.textContent = 'Invalid username or password';
    setTimeout(() => {
      errorDiv.textContent = '';
    }, 3000);
  }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', function() {
  sessionStorage.removeItem('adminLoggedIn');
  showLogin();
  showToast('Logged out successfully');
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const tabName = this.getAttribute('data-tab');
    
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    // Update active tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
  });
});

// Initialize products from script.js data or localStorage
function initializeProducts() {
  const savedProducts = localStorage.getItem('pjaProducts');
  if (!savedProducts) {
    // Default products from script.js
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
    localStorage.setItem('pjaProducts', JSON.stringify(defaultProducts));
  }
}

// Get products
function getProducts() {
  const products = localStorage.getItem('pjaProducts');
  return products ? JSON.parse(products) : [];
}

// Save products
function saveProducts(products) {
  localStorage.setItem('pjaProducts', JSON.stringify(products));
  // Also update script.js data for the main site
  updateMainSiteData(products);
}

// Update main site data
function updateMainSiteData(products) {
  // This will be used by the main site to load products
  localStorage.setItem('pjaProductsPublic', JSON.stringify(products));
}

// Load products
function loadProducts(filterCategory = 'All') {
  const products = getProducts();
  const filteredProducts = filterCategory === 'All' 
    ? products 
    : products.filter(p => p.category === filterCategory);
  
  const tbody = document.getElementById('productsTableBody');
  const productCount = document.getElementById('productCount');
  
  productCount.textContent = `${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`;
  
  if (filteredProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #64748b;">No products found</td></tr>';
    return;
  }
  
  tbody.innerHTML = filteredProducts.map(product => `
    <tr>
      <td>${product.id}</td>
      <td><strong>${product.name}</strong></td>
      <td>${product.category}</td>
      <td>${product.subCategory || '-'}</td>
      <td><span class="badge badge-${product.difficulty.toLowerCase()}">${product.difficulty}</span></td>
      <td>${product.price}</td>
      <td>${product.trending ? '<span class="badge badge-trending">🔥 Hot</span>' : '-'}</td>
      <td>
        <button class="action-btn edit" onclick="editProduct(${product.id})">Edit</button>
        <button class="action-btn delete" onclick="deleteProduct(${product.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Category filter
document.getElementById('categoryFilter').addEventListener('change', function() {
  loadProducts(this.value);
});

// Add product button
document.getElementById('addProductBtn').addEventListener('click', function() {
  openProductModal();
});

// Open product modal
function openProductModal(productId = null) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  const title = document.getElementById('modalTitle');
  
  form.reset();
  
  if (productId) {
    title.textContent = 'Edit Product';
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (product) {
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name;
      document.getElementById('productCategory').value = product.category;
      document.getElementById('productSubCategory').value = product.subCategory || '';
      document.getElementById('productDifficulty').value = product.difficulty;
      document.getElementById('productTime').value = product.time;
      document.getElementById('productMaterial').value = product.material;
      document.getElementById('productPrice').value = product.price;
      document.getElementById('productDescription').value = product.description;
      document.getElementById('productTrending').checked = product.trending || false;
    }
  } else {
    title.textContent = 'Add New Product';
    document.getElementById('productId').value = '';
  }
  
  modal.classList.add('open');
}

// Close modal
document.getElementById('closeModal').addEventListener('click', closeProductModal);
document.getElementById('cancelModal').addEventListener('click', closeProductModal);

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

// Save product
document.getElementById('productForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const productId = document.getElementById('productId').value;
  const products = getProducts();
  
  const productData = {
    id: productId ? parseInt(productId) : Date.now(),
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    subCategory: document.getElementById('productSubCategory').value,
    difficulty: document.getElementById('productDifficulty').value,
    time: document.getElementById('productTime').value,
    material: document.getElementById('productMaterial').value,
    price: document.getElementById('productPrice').value,
    description: document.getElementById('productDescription').value,
    trending: document.getElementById('productTrending').checked
  };
  
  if (productId) {
    // Update existing product
    const index = products.findIndex(p => p.id === parseInt(productId));
    if (index !== -1) {
      products[index] = productData;
      showToast('Product updated successfully!');
    }
  } else {
    // Add new product
    products.push(productData);
    showToast('Product added successfully!');
  }
  
  saveProducts(products);
  loadProducts();
  closeProductModal();
});

// Edit product
function editProduct(productId) {
  openProductModal(productId);
}

// Delete product
function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== productId);
    saveProducts(filteredProducts);
    loadProducts();
    showToast('Product deleted successfully!');
  }
}

// Load categories
function loadCategories() {
  const products = getProducts();
  const categories = [...new Set(products.map(p => p.category))];
  
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = categories.map(cat => {
    const count = products.filter(p => p.category === cat).length;
    return `
      <div class="category-card">
        <h3>${cat}</h3>
        <p>${count} product${count !== 1 ? 's' : ''}</p>
      </div>
    `;
  }).join('');
}

// Add category
document.getElementById('addCategoryBtn').addEventListener('click', function() {
  document.getElementById('categoryModal').classList.add('open');
});

document.getElementById('closeCategoryModal').addEventListener('click', function() {
  document.getElementById('categoryModal').classList.remove('open');
});

document.getElementById('cancelCategoryModal').addEventListener('click', function() {
  document.getElementById('categoryModal').classList.remove('open');
});

document.getElementById('categoryForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const categoryName = document.getElementById('categoryName').value;
  
  // Add to category select in product form
  const select = document.getElementById('productCategory');
  const option = document.createElement('option');
  option.value = categoryName;
  option.textContent = categoryName;
  select.appendChild(option);
  
  // Add to filter
  const filterSelect = document.getElementById('categoryFilter');
  const filterOption = document.createElement('option');
  filterOption.value = categoryName;
  filterOption.textContent = categoryName;
  filterSelect.appendChild(filterOption);
  
  document.getElementById('categoryModal').classList.remove('open');
  loadCategories();
  showToast('Category added successfully!');
});

// Load settings
function loadSettings() {
  const settings = localStorage.getItem('pjaSettings');
  if (settings) {
    const data = JSON.parse(settings);
    document.getElementById('whatsappNumber').value = data.whatsappNumber || '916372362313';
    document.getElementById('location').value = data.location || 'Suresh Singh Chowk, Panki Road, Redma, Daltonganj';
  }
}

// Save settings
document.getElementById('saveSettingsBtn').addEventListener('click', function() {
  const settings = {
    whatsappNumber: document.getElementById('whatsappNumber').value,
    location: document.getElementById('location').value
  };
  localStorage.setItem('pjaSettings', JSON.stringify(settings));
  showToast('Settings saved successfully!');
});

// Export data
document.getElementById('exportDataBtn').addEventListener('click', function() {
  const products = getProducts();
  const settings = localStorage.getItem('pjaSettings');
  
  const exportData = {
    products: products,
    settings: settings ? JSON.parse(settings) : {},
    exportDate: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `pja-studio-backup-${Date.now()}.json`;
  link.click();
  
  showToast('Data exported successfully!');
});

// Import data
document.getElementById('importDataBtn').addEventListener('click', function() {
  document.getElementById('importFileInput').click();
});

document.getElementById('importFileInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    try {
      const importData = JSON.parse(event.target.result);
      
      if (importData.products) {
        localStorage.setItem('pjaProducts', JSON.stringify(importData.products));
        loadProducts();
      }
      
      if (importData.settings) {
        localStorage.setItem('pjaSettings', JSON.stringify(importData.settings));
        loadSettings();
      }
      
      showToast('Data imported successfully!');
    } catch (error) {
      showToast('Error importing data. Invalid file format.', true);
    }
  };
  reader.readAsText(file);
});

// Toast notification
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show';
  if (isError) {
    toast.classList.add('error');
  }
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Initialize
initializeProducts();
checkAuth();
