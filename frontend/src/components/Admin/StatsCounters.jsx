import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Package, ShoppingCart, DollarSign } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

export default function StatsCounters() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    completedOrders: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/admin/dashboard');
      setStats(prevStats => ({ ...prevStats, ...data }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user, fetchStats]);


  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      change: `${stats.activeProducts} active`
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: `${stats.pendingOrders} pending`
    },
    {
      label: 'Completed Orders',
      value: stats.completedOrders,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: 'All time'
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
      change: 'Estimated'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              {loading && (
                <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-600">{stat.label}</p>
            <p className="text-xs text-slate-500 mt-2">{stat.change}</p>
          </div>
        )
      })}
    </div>
  )
}
