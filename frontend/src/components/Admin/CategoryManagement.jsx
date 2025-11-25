import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function CategoryManagement() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null); // Stores the full category object being edited
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', icon: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/categories');
      setCategories(data);
    } catch (error) {
      toast.error(`Failed to fetch categories: ${error.message}`);
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCategories();
    }
  }, [user, fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.slug) {
      toast.error('Name and slug are required.');
      return;
    }

    const toastId = toast.loading('Creating category...');
    try {
      await apiRequest('/categories', 'POST', newCategory);
      toast.success('Category created successfully', { id: toastId });
      setNewCategory({ name: '', slug: '', description: '', icon: '' });
      setShowAddForm(false);
      fetchCategories();
    } catch (error) {
      toast.error(`Failed to create category: ${error.message}`, { id: toastId });
      console.error(error);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    const toastId = toast.loading('Updating category...');
    try {
      // Only send the fields that can be updated
      const { id, name, description, icon, slug } = editingCategory;
      await apiRequest(`/categories/${id}`, 'PUT', { name, description, icon, slug });
      toast.success('Category updated successfully', { id: toastId });
      setEditingCategory(null);
      fetchCategories(); // Refreshes the list with updated data
    } catch (error) {
      toast.error(`Failed to update category: ${error.message}`, { id: toastId });
      console.error(error);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) return;

    const toastId = toast.loading('Deleting category...');
    try {
      await apiRequest(`/categories/${id}`, 'DELETE');
      toast.success('Category deleted successfully', { id: toastId });
      fetchCategories();
    } catch (error) {
      toast.error(`Failed to delete category: ${error.message}`, { id: toastId });
      console.error(error);
    }
  };
  
  const startEditing = (category) => {
    setEditingCategory({ ...category }); // Create a copy to avoid direct state mutation
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'slug') {
      processedValue = value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    }
    setEditingCategory(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleNewFormChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === 'slug') {
      processedValue = value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    }
     if (name === 'name' && !newCategory.slug) {
      const autoSlug = value.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
      setNewCategory(prev => ({ ...prev, name: value, slug: autoSlug }));
    } else {
      setNewCategory(prev => ({ ...prev, [name]: processedValue }));
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Category Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showAddForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <form onSubmit={handleAddCategory} className="bg-slate-50 rounded-lg p-4 mb-6 space-y-4 border border-slate-200">
          <h3 className="font-semibold text-lg text-slate-800">Create New Category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="newName">Name *</label>
              <input
                id="newName"
                name="name"
                type="text"
                value={newCategory.name}
                onChange={handleNewFormChange}
                className="input"
                placeholder="e.g., 3D Printing"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="newSlug">Slug *</label>
              <input
                id="newSlug"
                name="slug"
                type="text"
                value={newCategory.slug}
                onChange={handleNewFormChange}
                className="input"
                placeholder="e.g., 3d-printing"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="newDescription">Description</label>
            <textarea
              id="newDescription"
              name="description"
              value={newCategory.description}
              onChange={handleNewFormChange}
              className="input"
              rows={2}
              placeholder="Briefly describe this category"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="newIcon">Icon (Emoji)</label>
            <input
              id="newIcon"
              name="icon"
              type="text"
              value={newCategory.icon}
              onChange={handleNewFormChange}
              className="input w-full md:w-1/2"
              placeholder="e.g., 🖨️"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Create Category
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-8 text-slate-600">Loading categories...</div>
      ) : categories.length === 0 && !showAddForm ? (
        <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-700">No categories found</h3>
          <p className="mt-1">Click &quot;Add Category&quot; to create your first one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-slate-200 rounded-lg p-4 transition-all duration-300 hover:shadow-md hover:border-slate-300">
              {editingCategory?.id === category.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`editName-${category.id}`}>Name</label>
                      <input
                        id={`editName-${category.id}`}
                        name="name"
                        type="text"
                        value={editingCategory.name}
                        onChange={handleEditFormChange}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`editSlug-${category.id}`}>Slug</label>
                      <input
                        id={`editSlug-${category.id}`}
                        name="slug"
                        type="text"
                        value={editingCategory.slug}
                        onChange={handleEditFormChange}
                        className="input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`editDesc-${category.id}`}>Description</label>
                    <textarea
                      id={`editDesc-${category.id}`}
                      name="description"
                      value={editingCategory.description || ''}
                      onChange={handleEditFormChange}
                      className="input"
                      rows={2}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor={`editIcon-${category.id}`}>Icon</label>
                    <input
                      id={`editIcon-${category.id}`}
                      name="icon"
                      type="text"
                      value={editingCategory.icon || ''}
                      onChange={handleEditFormChange}
                      className="input w-full md:w-1/2"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleUpdateCategory}
                      className="btn btn-primary text-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="btn btn-outline text-sm"
                    >
                       <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {category.icon && <span className="text-2xl hidden sm:inline-block">{category.icon}</span>}
                      <div className="flex-grow">
                        <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                        <span className="badge badge-info text-xs font-mono">{category.slug}</span>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-sm text-slate-600 mt-2">{category.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Active Products: <span className="font-semibold">{category.productCount || 0}</span>
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => startEditing(category)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      aria-label={`Edit ${category.name}`}
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label={`Delete ${category.name}`}
                      disabled={category.productCount > 0}
                      title={category.productCount > 0 ? "Cannot delete category with products" : "Delete category"}
                    >
                      <Trash2 className={`w-4 h-4 ${category.productCount > 0 ? 'text-slate-400' : 'text-red-600'}`} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
