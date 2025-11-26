import { X, Package, User, Phone, Mail, MapPin, Calendar, Edit } from 'lucide-react';
import { useState } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

const OrderStatusEditor = ({ currentStatus, orderId, onStatusChange, user }) => {
    const [status, setStatus] = useState(currentStatus);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = await user.getIdToken();
            await apiRequest(`/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status }),
            });
            onStatusChange(status);
            setIsEditing(false);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Failed to update status.");
        } finally {
            setSaving(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="flex items-center gap-2">
                <span className={`badge ${
                    status === 'completed' ? 'badge-success' :
                    status === 'processing' ? 'badge-info' :
                    status === 'shipped' ? 'badge-primary' :
                    status === 'cancelled' ? 'badge-error' :
                    'badge-warning'
                }`}>{status}</span>
                <button onClick={() => setIsEditing(true)} className="p-1.5 hover:bg-slate-200 rounded">
                    <Edit className="w-4 h-4 text-slate-600" />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input input-sm">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
            </select>
            <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={() => { setIsEditing(false); setStatus(currentStatus); }} className="btn btn-ghost btn-sm">
                Cancel
            </button>
        </div>
    );
};


export default function OrderDetailsModal({ order, onClose, onUpdate }) {
    const { user } = useAuth();

    if (!order) return null;

    const handleStatusUpdated = (newStatus) => {
        onUpdate({ ...order, status: newStatus });
    };

    const total = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                <div className="sticky top-0 bg-white p-6 border-b border-slate-200 flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Order Details</h2>
                        <p className="text-sm text-slate-500 font-mono">ID: {order.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-6">
                    {/* Status and Date */}
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                        <div>
                            <label className="label">Status</label>
                            <OrderStatusEditor currentStatus={order.status} orderId={order.id} onStatusChange={handleStatusUpdated} user={user} />
                        </div>
                        <div>
                            <label className="label">Order Date</label>
                            <div className="flex items-center gap-2 text-slate-800">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span>{new Date(order.createdAt._seconds * 1000).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="border border-slate-200 rounded-lg">
                        <h3 className="px-4 py-2 text-sm font-semibold bg-slate-50 border-b border-slate-200">Customer</h3>
                        <div className="p-4 space-y-2">
                            <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="font-medium">{order.customer.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-slate-500" />
                                <span className="text-slate-600">{order.customer.phone}</span>
                            </div>
                            {order.customer.email && (
                                <div className="flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-slate-500" />
                                    <span className="text-slate-600">{order.customer.email}</span>
                                </div>
                            )}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-slate-500 mt-1" />
                                <span className="text-slate-600">{order.shippingAddress.fullAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-semibold mb-2">Items ({order.items.length})</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50 text-sm text-slate-600">
                                    <tr>
                                        <th className="text-left p-2 font-medium">Product</th>
                                        <th className="text-center p-2 font-medium">Qty</th>
                                        <th className="text-right p-2 font-medium">Price</th>
                                        <th className="text-right p-2 font-medium">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map(item => (
                                        <tr key={item.productId} className="border-t">
                                            <td className="p-2 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded bg-slate-100 overflow-hidden">
                                                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" /> : <Package className="w-full h-full text-slate-300 p-2" />}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm">{item.name}</div>
                                                    <div className="text-xs text-slate-500">SKU: {item.productId.slice(0, 8)}</div>
                                                </div>
                                            </td>
                                            <td className="p-2 text-center text-sm">{item.quantity}</td>
                                            <td className="p-2 text-right text-sm">₹{item.price.toFixed(2)}</td>
                                            <td className="p-2 text-right text-sm font-medium">₹{(item.price * item.quantity).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white p-6 border-t border-slate-200 flex justify-end items-center gap-4">
                    <span className="font-semibold">Order Total:</span>
                    <span className="text-2xl font-bold text-primary-600">₹{total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
