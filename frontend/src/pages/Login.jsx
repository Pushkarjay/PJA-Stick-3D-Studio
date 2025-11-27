import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { Mail, Lock, User, Eye, EyeOff, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const { login, signup, user, loading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/profile')
    }
  }, [user, loading, navigate])

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isSignUp) {
        // Validation for signup
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match')
          setSubmitting(false)
          return
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters')
          setSubmitting(false)
          return
        }
        
        await signup(formData.email, formData.password)
        toast.success('Account created successfully!')
        navigate('/profile')
      } else {
        await login(formData.email, formData.password)
        toast.success('Welcome back!')
        navigate('/profile')
      }
    } catch (err) {
      // Map Firebase error codes to user-friendly messages
      const errorMessages = {
        'auth/invalid-email': 'Invalid email address format.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/invalid-credential': 'Invalid email or password.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      }
      setError(errorMessages[err.code] || err.message || 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  const openWhatsApp = () => {
    const message = encodeURIComponent('Hi! I would like to place an order.')
    window.open(`https://wa.me/916372362313?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavBar />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-display font-bold text-slate-900">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
              <p className="text-slate-600 mt-2">
                {isSignUp 
                  ? 'Sign up to track your orders and save favorites' 
                  : 'Sign in to your account'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="input pl-10"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="input pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full py-3"
              >
                {submitting 
                  ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                  : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError('')
                    setFormData({ email: '', password: '', confirmPassword: '', name: '' })
                  }}
                  className="ml-2 text-primary-600 font-semibold hover:underline"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">Or</span>
              </div>
            </div>

            {/* WhatsApp Option */}
            <button
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-green-500 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Order via WhatsApp (No Login Required)
            </button>
          </div>

          {/* Admin Link */}
          <p className="text-center mt-6 text-slate-500 text-sm">
            Are you an admin?{' '}
            <Link to="/admin/login" className="text-primary-600 hover:underline">
              Admin Login
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
