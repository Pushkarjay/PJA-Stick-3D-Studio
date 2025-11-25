import { User, LogIn, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

export default function ProfileDropdown() {
  const { user, loading, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

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
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 text-slate-800 animate-fade-in-fast"
          onMouseLeave={() => setIsOpen(false)}
        >
          {user ? (
            <>
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold truncate">{user.displayName || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user.email}</p>
              </div>
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
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
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-100"
              onClick={() => setIsOpen(false)}
            >
              <LogIn className="w-4 h-4" />
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
