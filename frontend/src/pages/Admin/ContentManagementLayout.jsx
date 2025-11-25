import AdminLayout from '../AdminLayout';
import { Outlet } from 'react-router-dom';

export default function ContentManagementLayout() {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Content Management</h1>
        <Outlet />
      </div>
    </AdminLayout>
  );
}
