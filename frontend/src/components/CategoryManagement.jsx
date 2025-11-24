import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X } from 'lucide-react'

export default function CategoryManagement({ user }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(null)
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', icon: '' })
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await res.json()
      setCategories(data.data?.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategory.name || !newCategory.slug) return

    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCategory)
      })

      if (res.ok) {
        setNewCategory({ name: '', slug: '', description: '', icon: '' })
        setShowAddForm(false)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to create category')
      }
    } catch (error) {
      alert('Error creating category')
      console.error(error)
    }
  }

  const handleUpdateCategory = async (id, updates) => {
    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (res.ok) {
        setEditing(null)
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update category')
      }
    } catch (error) {
      alert('Error updating category')
      console.error(error)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return

    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (res.ok) {
        fetchCategories()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete category')
      }
    } catch (error) {
      alert('Error deleting category')
      console.error(error)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-900">Category Management</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </button>
      </div>

      {/* Add Category Form */}
      {showAddForm && (
        <form onSubmit={handleAddCategory} className="bg-slate-50 rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="input"
                placeholder="3D Printing"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="input"
                placeholder="3d-printing"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="input"
              rows={2}
              placeholder="Category description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Icon (emoji or class)</label>
            <input
              type="text"
              value={newCategory.icon}
              onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
              className="input"
              placeholder="🖨️ or fa-print"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Create Category
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setNewCategory({ name: '', slug: '', description: '', icon: '' })
              }}
              className="btn btn-outline"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Categories List */}
      {loading ? (
        <div className="text-center py-8 text-slate-600">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-slate-600">No categories yet. Add your first category!</div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.id} className="border border-slate-200 rounded-lg p-4">
              {editing === category.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={category.name}
                    onChange={(e) => setCategories(prev => prev.map(c => c.id === category.id ? { ...c, name: e.target.value } : c))}
                    className="input"
                  />
                  <textarea
                    value={category.description || ''}
                    onChange={(e) => setCategories(prev => prev.map(c => c.id === category.id ? { ...c, description: e.target.value } : c))}
                    className="input"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateCategory(category.id, { name: category.name, description: category.description })}
                      className="btn btn-primary text-sm"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditing(null)
                        fetchCategories()
                      }}
                      className="btn btn-outline text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {category.icon && <span className="text-2xl">{category.icon}</span>}
                      <h3 className="text-lg font-semibold text-slate-900">{category.name}</h3>
                      <span className="badge badge-info text-xs">{category.slug}</span>
                    </div>
                    {category.description && (
                      <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      Products: {category.productCount || 0}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(category.id)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
