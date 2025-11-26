import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Plus, Cog } from 'lucide-react'
import StatsCounters from '../../components/Admin/StatsCounters'
import { useAuth } from '../../hooks/useAuth'
import { apiRequest } from '../../lib/api'

const RecentOrders = ({ orders }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
    {orders.length === 0 ? (
      <p className="text-slate-500">No recent orders.</p>
    ) : (
      <ul className="divide-y divide-slate-100">
        {orders.map(order => (
          <li key={order.id} className="py-3 flex justify-between items-center">
            <div>
              <p className="font-medium text-slate-800">{order.customer?.name || order.customerName}</p>
              <p className="text-sm text-slate-500">{order.items.length} items - <span className="font-mono">#{order.orderNumber || order.id.slice(0,6)}</span></p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">₹{order.pricing?.total?.toFixed(2) || 'N/A'}</p>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>{order.status}</span>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const QuickActions = () => (
    <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/products" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-primary-600 mb-2" />
                <span className="font-semibold text-slate-700">Manage Products</span>
            </Link>
            <Link to="/admin/products" state={{ openForm: true }} className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
                <Plus className="w-8 h-8 text-green-600 mb-2" />
                <span className="font-semibold text-slate-700">Add New Product</span>
            </Link>
            <Link to="/admin/orders" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
                <ShoppingCart className="w-8 h-8 text-blue-600 mb-2" />
                <span className="font-semibold text-slate-700">View Orders</span>
            </Link>
            <Link to="/admin/settings/site" className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-slate-100 rounded-lg">
                <Cog className="w-8 h-8 text-slate-600 mb-2" />
                <span className="font-semibold text-slate-700">Site Settings</span>
            </Link>
        </div>
    </div>
);


export default function Dashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({ recentOrders: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await apiRequest('/api/admin/dashboard', {}, token);
        // Handle wrapped response { success: true, data: {...} }
        const dashData = response.data || response;
        setDashboardData(dashData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h1>
      <StatsCounters user={user} />
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          <div className="bg-white p-6 rounded-xl shadow-md"><p>Loading recent activity...</p></div>
        ) : (
          <>
            <RecentOrders orders={dashboardData.recentOrders || []} />
            <QuickActions />
          </>
        )}
      </div>
    </div>
  )
}
