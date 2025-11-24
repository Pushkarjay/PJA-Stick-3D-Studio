import { useState, useEffect } from 'react'
import { Upload, X, Loader } from 'lucide-react'
import { createProduct, updateProduct, getUploadUrl, uploadImage } from '../lib/api'

export default function ProductForm({ product, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'keychains',
    subCategory: '',
    price: '',
    priceTier: 'A',
    difficulty: 'easy',
    productionTime: 1,
    stockQty: 10,
    isActive: true,
    imageUrl: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'keychains',
        subCategory: product.subCategory || '',
        price: product.price || '',
        priceTier: product.priceTier || 'A',
        difficulty: product.difficulty || 'easy',
        productionTime: product.productionTime || 1,
        stockQty: product.stockQty || 10,
        isActive: product.isActive !== undefined ? product.isActive : true,
        imageUrl: product.imageUrl || ''
      })
      setImagePreview(product.imageUrl || '')
    }
  }, [product])

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setImageFile(file)
    setError('')

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const token = await user.getIdToken()
      let imageUrl = formData.imageUrl

      // Upload image if new image selected
      if (imageFile) {
        setUploading(true)
        try {
          // Get upload URL from backend
          const { uploadUrl, publicUrl } = await getUploadUrl(
            imageFile.name,
            imageFile.type,
            token
          )

          // Upload to Google Cloud Storage
          await uploadImage(uploadUrl, imageFile)
          imageUrl = publicUrl
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          setError('Failed to upload image. Please try again.')
          setSaving(false)
          setUploading(false)
          return
        } finally {
          setUploading(false)
        }
      }

      // Prepare product data
      const productData = {
        ...formData,
        imageUrl,
        price: parseFloat(formData.price) || 0,
        productionTime: parseInt(formData.productionTime) || 1,
        stockQty: parseInt(formData.stockQty) || 0
      }

      // Create or update product
      if (product?.id) {
        await updateProduct(product.id, productData, token)
      } else {
        await createProduct(productData, token)
      }

      onSave()
      onClose()
    } catch (err) {
      console.error('Save error:', err)
      setError(err.message || 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Product Image
              </label>
              <div className="flex items-start gap-4">
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview('')
                        setFormData({ ...formData, imageUrl: '' })
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  <p className="mt-2 text-sm text-slate-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            </div>

            {/* Name & Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input min-h-[100px]"
                rows={4}
                required
              />
            </div>

            {/* Category & SubCategory */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="keychains">Keychains</option>
                  <option value="decorations">Decorations</option>
                  <option value="miniatures">Miniatures</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Sub-Category
                </label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  className="input"
                  placeholder="Optional"
                />
              </div>
            </div>

            {/* Price & Price Tier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Base Price (₹) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Price Tier *
                </label>
                <select
                  value={formData.priceTier}
                  onChange={(e) => setFormData({ ...formData, priceTier: e.target.value })}
                  className="input"
                  required
                >
                  <option value="A">Tier A</option>
                  <option value="B">Tier B</option>
                  <option value="C">Tier C</option>
                  <option value="D">Tier D</option>
                </select>
              </div>
            </div>

            {/* Difficulty & Production Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="input"
                  required
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Production Time (days) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.productionTime}
                  onChange={(e) => setFormData({ ...formData, productionTime: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQty}
                onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                className="input"
                required
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700">
                Product is active and visible to customers
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={saving || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={saving || uploading}
            >
              {(saving || uploading) ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  {uploading ? 'Uploading...' : 'Saving...'}
                </>
              ) : (
                product ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
