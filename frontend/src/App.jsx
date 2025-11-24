import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './hooks/useCart'

import Home from './pages/Home'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'
import About from './pages/About'
import Contact from './pages/Contact'
import ProductPage from './pages/ProductPage'

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products/:id" element={<ProductPage />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
