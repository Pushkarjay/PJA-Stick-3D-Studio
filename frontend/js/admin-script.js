// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : '/api';

// Authentication - Hardcoded for prototype
// TODO: Implement proper authentication for production
const ADMIN_CREDENTIALS = {
  username: 'pushkarjay',
  password: 'pja3d@admin2025'
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

// Initialize products from backend API
async function initializeProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) throw new Error('Failed to load products');
    
    const result = await response.json();
    const products = result.data?.products || result.data || [];
    
    localStorage.setItem('pjaProducts', JSON.stringify(products));
    return products;
  } catch (error) {
    console.error('Error loading products:', error);
    
    // Fallback to localStorage
    const savedProducts = localStorage.getItem('pjaProducts');
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
    
    return [];
  }
}

// Get products
async function getProducts() {
  const products = await initializeProducts();
  return products;
}

// Save product (TODO: Implement POST/PUT to backend)
async function saveProduct(productData) {
  console.warn('Product save to backend not fully implemented yet. Saving to localStorage.');
  
  // TODO: Uncomment when backend endpoints are ready
  /*
  try {
    const method = productData.id ? 'PUT' : 'POST';
    const endpoint = productData.id 
      ? `${API_BASE_URL}/products/${productData.id}` 
      : `${API_BASE_URL}/products`;
    
    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) throw new Error('Failed to save product');
    return await response.json();
  } catch (error) {
    console.error('Error saving product:', error);
    throw error;
  }
  */
  
  // Temporary localStorage fallback
  const products = await getProducts();
  if (productData.id) {
    const index = products.findIndex(p => p.id === productData.id);
    if (index !== -1) products[index] = productData;
  } else {
    productData.id = `prod_${Date.now()}`;
    products.push(productData);
  }
  localStorage.setItem('pjaProducts', JSON.stringify(products));
  return productData;
}

// Delete product (TODO: Implement DELETE to backend)
async function deleteProductById(productId) {
  console.warn('Product delete from backend not fully implemented yet. Deleting from localStorage.');
  
  // TODO: Uncomment when backend endpoints are ready
  /*
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete product');
    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
  */
  
  // Temporary localStorage fallback
  const products = await getProducts();
  const filtered = products.filter(p => p.id !== productId);
  localStorage.setItem('pjaProducts', JSON.stringify(filtered));
}

// Save products (DEPRECATED - use saveProduct instead)
function saveProducts(products) {
  localStorage.setItem('pjaProducts', JSON.stringify(products));
  console.warn('saveProducts() is deprecated. Use saveProduct() for individual products.');
}

// Update main site data
function updateMainSiteData(products) {
  // This will be used by the main site to load products
  localStorage.setItem('pjaProductsPublic', JSON.stringify(products));
}

// Load products
async function loadProducts(filterCategory = 'All') {
  const products = await getProducts();
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
async function openProductModal(productId = null) {
  const modal = document.getElementById('productModal');
  const form = document.getElementById('productForm');
  const title = document.getElementById('modalTitle');
  
  form.reset();
  
  if (productId) {
    title.textContent = 'Edit Product';
    const products = await getProducts();
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
      document.getElementById('productImageUrl').value = product.imageUrl || '';
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
document.getElementById('productForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const productId = document.getElementById('productId').value;
  
  const productData = {
    id: productId || null,
    name: document.getElementById('productName').value,
    category: document.getElementById('productCategory').value,
    subCategory: document.getElementById('productSubCategory').value,
    difficulty: document.getElementById('productDifficulty').value,
    time: document.getElementById('productTime').value,
    material: document.getElementById('productMaterial').value,
    price: document.getElementById('productPrice').value,
    description: document.getElementById('productDescription').value,
    trending: document.getElementById('productTrending').checked,
    imageUrl: document.getElementById('productImageUrl').value
  };
  
  try {
    await saveProduct(productData);
    showToast(productId ? 'Product updated successfully!' : 'Product added successfully!');
    await loadProducts();
    closeProductModal();
  } catch (error) {
    showToast('Error saving product: ' + error.message, 'error');
  }
});

// Edit product
function editProduct(productId) {
  openProductModal(productId);
}

// Delete product
async function deleteProduct(productId) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      await deleteProductById(productId);
      await loadProducts();
      showToast('Product deleted successfully!');
    } catch (error) {
      showToast('Error deleting product: ' + error.message, 'error');
    }
  }
}

// Load categories
async function loadCategories() {
  const products = await getProducts();
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
