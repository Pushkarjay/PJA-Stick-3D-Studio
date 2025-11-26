import { useState, useEffect, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import OrderDetailsModal from '../../components/Admin/OrderDetailsModal';

export default function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await apiRequest('/api/orders', {}, token);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOrderUpdate = (updatedOrder) => {
    setOrders(prevOrders => prevOrders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    setSelectedOrder(updatedOrder); // Keep modal open with updated data
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Orders</h1>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="th">Order ID</th>
              <th className="th">Customer</th>
              <th className="th text-center">Items</th>
              <th className="th">Total</th>
              <th className="th">Status</th>
              <th className="th">Date</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-12">Loading orders...</td></tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="td font-mono text-sm">#{order.orderNumber || order.id.slice(0, 8)}</td>
                <td className="td">
                  <div className="font-medium">{order.customer?.name || order.customerName}</div>
                  <div className="text-slate-600 text-sm">{order.customer?.phone || order.customerPhone}</div>
                </td>
                <td className="td text-center">{order.items?.length || 0}</td>
                <td className="td font-medium">₹{order.pricing?.total.toFixed(2) || 'N/A'}</td>
                <td className="td">
                  <span className={`badge ${
                    order.status === 'completed' ? 'badge-success' :
                    order.status === 'processing' ? 'badge-info' :
                    order.status === 'shipped' ? 'badge-primary' :
                    order.status === 'cancelled' ? 'badge-error' :
                    'badge-warning'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="td text-sm">
                  {new Date(order.createdAt._seconds ? order.createdAt._seconds * 1000 : order.createdAt).toLocaleDateString()}
                </td>
                <td className="td text-right">
                  <button onClick={() => setSelectedOrder(order)} className="p-2 hover:bg-slate-100 rounded-lg">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && orders.length === 0 && (
          <div className="text-center py-12 text-slate-600">
            No orders yet.
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleOrderUpdate}
        />
      )}
    </>
  )
}
