import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../lib/api';
import toast from 'react-hot-toast';
import { UserPlus, Eye, EyeOff, Trash2, Edit2, Shield, ShieldOff, RefreshCw } from 'lucide-react';

export default function CreateAdminPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await apiRequest('/api/admin/admins', {}, token);
      setAdmins(response.data || []);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    try {
      setSubmitting(true);
      const token = await user.getIdToken();
      await apiRequest('/api/admin/create-admin', {
        method: 'POST',
        body: JSON.stringify(formData),
      }, token);
      
      toast.success('Admin user created successfully');
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchAdmins();
    } catch (error) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      const token = await user.getIdToken();
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      
      if (newStatus === 'Inactive') {
        await apiRequest(`/api/admin/admins/${adminId}`, {
          method: 'DELETE',
        }, token);
      } else {
        await apiRequest(`/api/admin/admins/${adminId}`, {
          method: 'PUT',
          body: JSON.stringify({ status: newStatus }),
        }, token);
      }
      
      toast.success(`Admin ${newStatus === 'Active' ? 'activated' : 'deactivated'}`);
      fetchAdmins();
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update admin status');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Handle ISO string, Firestore Timestamp, or Date object
    let date;
    if (typeof timestamp === 'string') {
      date = new Date(timestamp);
    } else if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleMigrate = async () => {
    if (!confirm('This will sync all admins to the users collection so they can login. Continue?')) {
      return;
    }
    
    try {
      setMigrating(true);
      const token = await user.getIdToken();
      const response = await apiRequest('/api/admin/admins/migrate', {
        method: 'POST',
      }, token);
      toast.success(response.message || 'Migration complete!');
      fetchAdmins();
    } catch (error) {
      console.error('Migration error:', error);
      toast.error(error.message || 'Migration failed');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Users</h1>
          <p className="text-slate-500">Manage administrator accounts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleMigrate}
            disabled={migrating}
            className="btn btn-secondary flex items-center gap-2"
            title="Sync admins to enable login"
          >
            <RefreshCw className={`w-5 h-5 ${migrating ? 'animate-spin' : ''}`} />
            {migrating ? 'Syncing...' : 'Sync Admins'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Create Admin
          </button>
        </div>
      </div>

      {/* Create Admin Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Create New Admin</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input w-full pr-10"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Creating...' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-slate-500 mt-2">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No admin users found</p>
            <p className="text-sm text-slate-400">Create your first admin user above</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(admin.name || admin.email)}&background=random`}
                        alt={admin.name}
                        className="w-10 h-10 rounded-full mr-3"
                      />
                      <div>
                        <p className="font-medium text-slate-900">{admin.name || 'Unnamed'}</p>
                        <p className="text-xs text-slate-500">ID: {admin.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        admin.status === 'Active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {admin.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleToggleStatus(admin.id, admin.status)}
                      className={`p-2 rounded-lg transition-colors ${
                        admin.status === 'Active'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                    >
                      {admin.status === 'Active' ? (
                        <ShieldOff className="w-5 h-5" />
                      ) : (
                        <Shield className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
