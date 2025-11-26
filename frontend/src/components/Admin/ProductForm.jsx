import { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, X, Loader, Plus, Trash2, Info } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import toast from 'react-hot-toast';

const CostInput = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">₹</span>
            </div>
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                className="input pl-7"
                step="0.01"
                min="0"
                placeholder="0.00"
            />
        </div>
    </div>
);


export default function ProductForm({ product, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'keychains',
    subCategory: '',
    price: '',
    priceTier: 'A',
    difficulty: 'easy',
    productionTime: '',
    stockQty: '',
    isActive: true,
    isFeatured: false,
    imageUrl: '',
    tags: [],
    features: [''],
    cost: {
        material: '',
        time: '',
        finishing: '',
    }
  })
  const [tagsInput, setTagsInput] = useState('');
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dropdownOptions, setDropdownOptions] = useState({
    category: [],
    priceTier: [],
    difficulty: [],
  });

  const totalCost = useMemo(() => {
    const { material, time, finishing } = formData.cost;
    return (parseFloat(material) || 0) + (parseFloat(time) || 0) + (parseFloat(finishing) || 0);
  }, [formData.cost]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, price: totalCost > 0 ? totalCost.toFixed(2) : '' }));
  }, [totalCost]);

  const fetchDropdowns = useCallback(async () => {
    try {
      const { data } = await apiRequest('/api/dropdowns');
      setDropdownOptions(prev => ({
        ...prev,
        ...Object.keys(prev).reduce((acc, key) => {
          acc[key] = data[key]?.values || [];
          return acc;
        }, {})
      }));
    } catch (err) {
      toast.error('Failed to load form options.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    if (product) {
      const productCost = product.cost || { material: '', time: '', finishing: '' };
      const totalProductCost = (parseFloat(productCost.material) || 0) + (parseFloat(productCost.time) || 0) + (parseFloat(productCost.finishing) || 0);

      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'keychains',
        subCategory: product.subCategory || '',
        price: product.price || (totalProductCost > 0 ? totalProductCost.toFixed(2) : ''),
        priceTier: product.priceTier || 'A',
        difficulty: product.difficulty || 'easy',
        productionTime: product.productionTime || '',
        stockQty: product.stockQty ?? '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        imageUrl: product.imageUrl || '',
        tags: product.tags || [],
        features: product.features?.length ? product.features : [''],
        cost: productCost,
      })
      setImagePreview(product.imageUrl || '')
      if (product.tags) {
        setTagsInput(product.tags.join(', '));
      }
    }
  }, [product])

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB.')
      return
    }

    setImageFile(file)
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleTagsChange = (e) => {
    const { value } = e.target;
    setTagsInput(value);
    const tagsArray = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  }

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  }

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  }
  
  const handleCostChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        cost: {
            ...prev.cost,
            [name]: value
        }
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const token = await user.getIdToken()
      let imageUrl = formData.imageUrl

      if (imageFile) {
        setUploading(true);
        try {
          const response = await apiRequest(
            '/api/upload/generate-url',
            {
              method: 'POST',
              body: JSON.stringify({ fileName: imageFile.name, contentType: imageFile.type })
            },
            token
          );
          const uploadData = response.data || response;
          
          await fetch(uploadData.uploadUrl, { method: 'PUT', body: imageFile, headers: { 'Content-Type': imageFile.type } });
          imageUrl = uploadData.publicUrl;

        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          setError('Failed to upload image. Please try again.');
          setSaving(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      const productData = {
        ...formData,
        imageUrl,
        price: parseFloat(formData.price) || 0,
        productionTime: formData.productionTime ? parseInt(formData.productionTime) : null,
        stockQty: formData.stockQty ? parseInt(formData.stockQty) : null,
        features: formData.features.filter(f => f), // Remove empty features
        cost: {
            material: parseFloat(formData.cost.material) || 0,
            time: parseFloat(formData.cost.time) || 0,
            finishing: parseFloat(formData.cost.finishing) || 0,
        }
      };
      
      const method = product?.id ? 'PUT' : 'POST';
      const endpoint = product?.id ? `/api/admin/products/${product.id}` : '/api/admin/products';

      await apiRequest(endpoint, {
        method,
        body: JSON.stringify(productData)
      }, token);

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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Name & Description */}
              <div>
                <label className="label">Product Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input min-h-[100px]" rows={4} />
              </div>

              {/* Features */}
              <div>
                <label className="label">Features</label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input type="text" value={feature} onChange={(e) => handleFeatureChange(index, e.target.value)} className="input" placeholder={`Feature ${index + 1}`} />
                      <button type="button" onClick={() => removeFeature(index)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={addFeature} className="btn btn-outline btn-sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Feature
                  </button>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Pricing & Cost</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <CostInput label="Material Cost" name="material" value={formData.cost.material} onChange={handleCostChange} />
                      <CostInput label="Time Cost" name="time" value={formData.cost.time} onChange={handleCostChange} />
                      <CostInput label="Finishing Cost" name="finishing" value={formData.cost.finishing} onChange={handleCostChange} />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Calculated Price (₹)</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-gray-500 sm:text-sm">₹</span>
                                </div>
                                <input 
                                    type="number" 
                                    value={formData.price} 
                                    className="input pl-7 bg-slate-100 cursor-not-allowed" 
                                    readOnly 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label">Price Tier</label>
                            <select value={formData.priceTier} onChange={(e) => setFormData({ ...formData, priceTier: e.target.value })} className="input">
                                {dropdownOptions.priceTier?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-blue-50 p-2 rounded-md">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>The final price is automatically calculated from the costs above.</span>
                  </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="label">Product Image</label>
                <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-slate-100">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setFormData({ ...formData, imageUrl: '' }); }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-48 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
                        <Upload className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              
              {/* Category & SubCategory */}
              <div>
                <label className="label">Category</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="input">
                  <option value="">Select a category</option>
                  {dropdownOptions.category?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Sub-Category</label>
                <input type="text" value={formData.subCategory} onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })} className="input" placeholder="e.g., Anime, Marvel" />
              </div>

              {/* Tags */}
              <div>
                <label className="label">Tags</label>
                <input type="text" value={tagsInput} onChange={handleTagsChange} className="input" placeholder="onepiece, naruto, keychain" />
                <p className="text-xs text-slate-500 mt-1">Comma-separated values.</p>
              </div>

              {/* Production Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Difficulty</label>
                  <select value={formData.difficulty} onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })} className="input">
                    {dropdownOptions.difficulty?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Prod. Time (days)</label>
                  <input type="number" min="0" value={formData.productionTime} onChange={(e) => setFormData({ ...formData, productionTime: e.target.value })} className="input" />
                </div>
              </div>

              {/* Stock & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="label">Stock Quantity</label>
                    <input type="number" min="0" value={formData.stockQty} onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })} className="input" />
                </div>
                <div className="flex items-end pb-2">
                    <div className="flex items-center gap-3">
                        <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                        <label htmlFor="isActive" className="label mb-0">Is Active</label>
                    </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex gap-3">
            <button type="button" onClick={onClose} className="btn btn-outline flex-1" disabled={saving || uploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1" disabled={saving || uploading}>
              {(saving || uploading) ? (
                <><Loader className="w-4 h-4 mr-2 animate-spin" />{uploading ? 'Uploading...' : 'Saving...'}</>
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
