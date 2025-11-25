import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/Admin/AdminSidebar'
import AdminHeader from '../components/Admin/AdminHeader'
import { useAuth } from '../hooks/useAuth'
import AdminLogin from './Admin/AdminLogin'

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return <AdminLogin />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
