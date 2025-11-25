import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Users,
  MessageSquare,
  Library,
  ChevronDown,
  FileUp,
  CreditCard,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useState } from 'react'

const NavGroup = ({ group, handleLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <group.icon className="w-5 h-5" />
          <span>{group.text}</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pt-1 pl-8 space-y-1 animate-slide-down-fast">
          {group.subLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block p-2 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'hover:bg-slate-700'
                }`
              }
            >
              {link.text}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}


const NavLinkItem = ({ link }) => (
  <NavLink
    to={link.path}
    className={({ isActive }) =>
      `flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
        isActive ? 'bg-primary-600 text-white' : 'hover:bg-slate-700'
      }`
    }
  >
    <link.icon className="w-5 h-5" />
    {link.text}
  </NavLink>
);

const navLinks = [
  { icon: LayoutDashboard, text: 'Dashboard', path: '/admin/dashboard' },
  { icon: Package, text: 'Products', path: '/admin/products' },
  { icon: ShoppingCart, text: 'Orders', path: '/admin/orders' },
  { icon: Users, text: 'Users', path: '/admin/users' },
  { icon: MessageSquare, text: 'Reviews', path: '/admin/reviews' },
  {
    icon: Library,
    text: 'Content',
    subLinks: [
      { text: 'Categories', path: '/admin/content/categories' },
      { text: 'Dropdowns', path: '/admin/content/dropdowns' },
    ],
  },
  { icon: Settings, text: 'Site Settings', path: '/admin/settings' },
  { icon: FileUp, text: 'Import / Export', path: '/admin/import' },
  { icon: CreditCard, text: 'Billing', path: '/admin/billing' },
]

export default function AdminSidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="w-64 bg-slate-800 text-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <img src="/assets/logo-icon.png" alt="PJA3D Icon" className="h-8"/>
        <div>
          <h1 className="text-xl font-display font-bold text-white">
            PJA<span className="text-primary-400">3D</span>
          </h1>
          <span className="text-xs text-slate-400">Admin Panel</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1.5">
        {navLinks.map((link) =>
          link.subLinks ? (
            <NavGroup key={link.text} group={link} />
          ) : (
            <NavLinkItem key={link.text} link={link} />
          )
        )}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center mb-3">
           <img
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || user?.email}&background=random`}
            alt="Admin"
            className="w-9 h-9 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-medium text-white truncate">{user?.displayName || user?.email}</p>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}
