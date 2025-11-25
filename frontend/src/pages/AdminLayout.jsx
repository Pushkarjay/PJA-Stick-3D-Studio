import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/Admin/AdminSidebar'
import AdminHeader from '../components/Admin/AdminHeader'

export default function AdminLayout() {
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
