import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './hooks/useCart'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Checkout from './pages/Checkout'

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </Router>
    </CartProvider>
  )
}

export default App
