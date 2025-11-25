import { Bell, Search } from 'lucide-react'

export default function AdminHeader() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent text-sm"
            />
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-slate-100">
              <Bell className="w-5 h-5 text-slate-600" />
            </button>
            {/* User profile is in the sidebar */}
          </div>
        </div>
      </div>
    </header>
  )
}
