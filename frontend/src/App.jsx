import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { CartProvider } from './hooks/useCart'

import Home from './pages/Home'
import AdminLayout from './pages/AdminLayout'
import Dashboard from './pages/Admin/Dashboard'
import ProductManagement from './pages/Admin/ProductManagement'
import OrderManagement from './pages/Admin/OrderManagement'
import SiteSettings from './pages/Admin/SiteSettings'
import UserManagementPage from './pages/Admin/UserManagementPage'
import CategoryManagementPage from './pages/Admin/CategoryManagementPage'
import ImportPage from './pages/Admin/ImportPage'
import BillingPage from './pages/Admin/BillingPage'
import AdminLogin from './pages/Admin/AdminLogin'
import DropdownManagementPage from './pages/Admin/DropdownManagement';
import ReviewManagementPage from './pages/Admin/ReviewManagementPage';
import ContentManagementLayout from './pages/Admin/ContentManagementLayout';
import CreateAdminPage from './pages/Admin/CreateAdminPage';
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import ProductPage from './pages/ProductPage'

import Products from './pages/Products';

function ProtectedAdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="reviews" element={<ReviewManagementPage />} />
              <Route path="content/categories" element={<CategoryManagementPage />} />
              <Route path="content/dropdowns" element={<DropdownManagementPage />} />
              <Route path="settings" element={<SiteSettings />} />
              <Route path="import" element={<ImportPage />} />
              <Route path="billing" element={<BillingPage />} />
              <Route path="create-admin" element={<CreateAdminPage />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
