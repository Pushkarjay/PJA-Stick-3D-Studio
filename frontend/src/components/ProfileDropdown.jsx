import { User, LogIn, LogOut, MessageCircle, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { apiRequest } from '../lib/api';

export default function ProfileDropdown() {
  const { user, loading, logout, isAdmin } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('916372362313')
  const [instagramHandle, setInstagramHandle] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiRequest('/api/settings')
        const settings = response.data || response
        if (settings.contact?.whatsapp) {
          setWhatsappNumber(settings.contact.whatsapp.replace(/[^0-9]/g, ''))
        }
        if (settings.socialLinks?.instagram) {
          setInstagramHandle(settings.socialLinks.instagram)
        }
      } catch (e) {
        // Use defaults
      }
    }
    fetchSettings()
  }, [])

  const openWhatsApp = () => {
    const message = encodeURIComponent('Hi! I would like to place an order.')
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank')
  }

  const openInstagram = () => {
    if (instagramHandle) {
      window.open(instagramHandle, '_blank')
    }
  }

  if (loading) {
    return <div className="w-8 h-8 bg-slate-700 rounded-full animate-pulse" />
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-800 rounded-full transition-colors"
        aria-label="User profile"
      >
        {user ? (
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=random`}
            alt="User"
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <User className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-50 text-slate-800 animate-fade-in-fast"
          onMouseLeave={() => setIsOpen(false)}
        >
          {user ? (
            <>
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 text-primary-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-slate-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold">Order via Social Media</p>
                <p className="text-xs text-slate-500">We take orders on WhatsApp & Instagram</p>
              </div>
              <button
                onClick={() => {
                  openWhatsApp()
                  setIsOpen(false)
                }}
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-green-50 text-green-600"
              >
                <MessageCircle className="w-4 h-4" />
                Order on WhatsApp
              </button>
              {instagramHandle && (
                <button
                  onClick={() => {
                    openInstagram()
                    setIsOpen(false)
                  }}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-pink-50 text-pink-600"
                >
                  <Instagram className="w-4 h-4" />
                  Order on Instagram
                </button>
              )}
              <div className="border-t">
                <Link
                  to="/admin/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100 text-slate-500"
                  onClick={() => setIsOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
