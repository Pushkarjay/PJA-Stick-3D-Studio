import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit } from 'lucide-react'
import { apiRequest } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

const CreateAdminForm = ({ onUserCreated }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '', displayName: '', role: 'admin' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const token = await user.getIdToken();
            const newUser = await apiRequest('/api/users/create-admin', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            setMessage(`User ${newUser.data.email} created successfully!`);
            onUserCreated(newUser.data);
            setFormData({ email: '', password: '', displayName: '', role: 'admin' });
        } catch (error) {
            setMessage(error.message || 'Error creating user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold flex items-center gap-3 mb-4 text-slate-800">
                <UserPlus className="w-6 h-6 text-primary-600" />
                Create New Admin User
            </h3>
            {message && <p className={`mb-4 text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="Email Address" />
                    <input type="password" required minLength={6} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" placeholder="Password" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="input" placeholder="Display Name (Optional)" />
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="input">
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full">
                    {loading ? 'Creating...' : 'Create User'}
                </button>
            </form>
        </div>
    );
};

const UserRow = ({ user, onRoleChange, currentUser }) => {
    const [role, setRole] = useState(user.role);
    const [isEditing, setIsEditing] = useState(false);

    const handleRoleChange = async (newRole) => {
        if (currentUser.uid === user.uid && newRole !== currentUser.role) {
            if (!confirm("You are changing your own role. Are you sure?")) {
                return;
            }
        }
        try {
            await onRoleChange(user.uid, newRole);
            setRole(newRole);
            setIsEditing(false);
        } catch (error) {
            alert(`Failed to update role: ${error.message}`);
        }
    };

    return (
        <tr className="border-b border-slate-100 hover:bg-slate-50">
            <td className="p-4">
                <div className="font-medium text-slate-900">{user.displayName || 'N/A'}</div>
                <div className="text-sm text-slate-600">{user.email}</div>
            </td>
            <td className="p-4 text-sm text-slate-600">
                {new Date(user.createdAt?._seconds * 1000 || user.createdAt).toLocaleDateString()}
            </td>
            <td className="p-4">
                {isEditing ? (
                    <select value={role} onChange={(e) => handleRoleChange(e.target.value)} className="input input-sm">
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                    </select>
                ) : (
                    <span className={`badge ${
                        user.role === 'super_admin' ? 'badge-error' :
                        user.role === 'admin' ? 'badge-success' :
                        'badge-ghost'
                    }`}>{user.role}</span>
                )}
            </td>
            <td className="p-4 text-right">
                {currentUser.role === 'super_admin' && (
                    <button onClick={() => setIsEditing(!isEditing)} className="p-2 hover:bg-slate-100 rounded-lg">
                        <Edit className="w-4 h-4" />
                    </button>
                )}
            </td>
        </tr>
    );
};

export default function UserManagementPanel() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUsers = useCallback(async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            const token = await currentUser.getIdToken();
            const data = await apiRequest('/api/users', {}, token);
            setUsers(data || []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (uid, role) => {
        const token = await currentUser.getIdToken();
        await apiRequest(`/api/users/${uid}/role`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ role })
        });
        // Optimistically update UI, or refetch
        setUsers(users.map(u => u.uid === uid ? { ...u, role } : u));
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
            
            {currentUser?.role === 'super_admin' && (
                <CreateAdminForm onUserCreated={(newUser) => setUsers([newUser, ...users])} />
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="th">User</th>
                            <th className="th">Joined</th>
                            <th className="th">Role</th>
                            <th className="th text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-12">Loading users...</td></tr>
                        ) : (
                            users.map(user => (
                                <UserRow key={user.uid} user={user} onRoleChange={handleRoleChange} currentUser={currentUser} />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
