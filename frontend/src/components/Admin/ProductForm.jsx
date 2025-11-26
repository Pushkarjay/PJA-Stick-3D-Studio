import { useState, useEffect, useCallback, useMemo } from 'react';
import { Upload, X, Loader, Plus, Trash2, Info, ChevronDown } from 'lucide-react';
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

const PercentInput = ({ label, name, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            <input
                type="number"
                name={name}
                value={value}
                onChange={onChange}
                className="input pr-8"
                step="1"
                min="0"
                max="100"
                placeholder="0"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">%</span>
            </div>
        </div>
    </div>
);

// Dropdown with "Create New" option
const CreatableDropdown = ({ label, name, value, options, onChange, onCreateNew, placeholder }) => {
  const [showInput, setShowInput] = useState(false);
  const [newValue, setNewValue] = useState('');

  const handleCreate = () => {
    if (newValue.trim()) {
      onCreateNew(name, newValue.trim());
      onChange({ target: { value: newValue.trim() } });
      setNewValue('');
      setShowInput(false);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {showInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="input flex-1"
            placeholder={`Enter new ${label.toLowerCase()}`}
            autoFocus
          />
          <button type="button" onClick={handleCreate} className="btn btn-primary btn-sm">Add</button>
          <button type="button" onClick={() => setShowInput(false)} className="btn btn-outline btn-sm">Cancel</button>
        </div>
      ) : (
        <div className="relative">
          <select value={value} onChange={onChange} className="input appearance-none pr-10">
            <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
            {options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <button
            type="button"
            onClick={() => setShowInput(true)}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            + New
          </button>
        </div>
      )}
    </div>
  );
};


export default function ProductForm({ product, onClose, onSave, user }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subCategory: '',
    price: '',
    actualPrice: '',
    baseDiscount: '',
    extraDiscount: '',
    discountedPrice: '',
    priceTier: '',
    difficulty: '',
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
    subCategory: [],
    priceTier: [],
    difficulty: [],
  });

  // Calculate total cost from material, time, finishing
  const totalCost = useMemo(() => {
    const { material, time, finishing } = formData.cost;
    return (parseFloat(material) || 0) + (parseFloat(time) || 0) + (parseFloat(finishing) || 0);
  }, [formData.cost]);

  // Calculate discounted price based on actual price and discounts
  const calculatedDiscountedPrice = useMemo(() => {
    const actualPrice = parseFloat(formData.actualPrice) || 0;
    const baseDiscount = parseFloat(formData.baseDiscount) || 0;
    const extraDiscount = parseFloat(formData.extraDiscount) || 0;
    const totalDiscountPercent = baseDiscount + extraDiscount;
    const discountAmount = (actualPrice * totalDiscountPercent) / 100;
    return actualPrice - discountAmount;
  }, [formData.actualPrice, formData.baseDiscount, formData.extraDiscount]);

  // Auto-update price from cost if cost is entered
  useEffect(() => {
    if (totalCost > 0) {
      setFormData(prev => ({ ...prev, price: totalCost.toFixed(2) }));
    }
  }, [totalCost]);

  // Auto-update discounted price
  useEffect(() => {
    if (formData.actualPrice) {
      setFormData(prev => ({ ...prev, discountedPrice: calculatedDiscountedPrice.toFixed(2) }));
    }
  }, [calculatedDiscountedPrice, formData.actualPrice]);

  const fetchDropdowns = useCallback(async () => {
    try {
      // Fetch categories from the categories API (main source of truth)
      const catResponse = await apiRequest('/api/categories');
      const categoriesData = catResponse.data || [];
      const categoryNames = categoriesData.length > 0 
        ? categoriesData.map(c => c.name)
        : [];
      
      // Fetch other dropdown options
      const response = await apiRequest('/api/dropdowns');
      const data = response.data || response || {};
      
      setDropdownOptions(prev => ({
        ...prev,
        category: categoryNames.length > 0 ? categoryNames : (data.category || []),
        subCategory: data.subCategory || [],
        priceTier: data.priceTier || ['A', 'B', 'C', 'D'],
        difficulty: data.difficulty || ['Easy', 'Medium', 'Hard'],
      }));
    } catch (err) {
      toast.error('Failed to load form options.');
      console.error(err);
    }
  }, []);

  // Handle creating new dropdown option
  const handleCreateNewOption = async (fieldName, newValue) => {
    try {
      const token = await user.getIdToken();
      
      if (fieldName === 'category') {
        // For categories, create in the categories collection (main source of truth)
        const slug = newValue.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await apiRequest('/api/categories', {
          method: 'POST',
          body: JSON.stringify({ 
            name: newValue, 
            slug: slug,
            description: '',
            isActive: true
          })
        }, token);
        toast.success(`Category "${newValue}" created successfully`);
      } else {
        // For other dropdowns (subCategory, priceTier, etc.), use dropdownOptions
        await apiRequest('/api/dropdowns', {
          method: 'POST',
          body: JSON.stringify({ fieldName, value: newValue })
        }, token);
        toast.success(`Added "${newValue}" to ${fieldName}`);
      }
      
      // Update local state
      setDropdownOptions(prev => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), newValue]
      }));
    } catch (err) {
      console.error('Error creating option:', err);
      // Still update local state even if API fails (for immediate UI feedback)
      setDropdownOptions(prev => ({
        ...prev,
        [fieldName]: [...(prev[fieldName] || []), newValue]
      }));
      toast.error(`Failed to save "${newValue}" - please add it via Category Management`);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    if (product) {
      const productCost = product.cost || { material: '', time: '', finishing: '' };

      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        subCategory: product.subCategory || '',
        price: product.price || '',
        actualPrice: product.actualPrice || product.price || '',
        baseDiscount: product.baseDiscount || '',
        extraDiscount: product.extraDiscount || '',
        discountedPrice: product.discountedPrice || '',
        priceTier: product.priceTier || '',
        difficulty: product.difficulty || '',
        productionTime: product.productionTime || '',
        stockQty: product.stockQty ?? '',
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured || false,
        imageUrl: product.imageUrl || product.imageUrls?.[0] || '',
        tags: product.tags || [],
        features: product.features?.length ? product.features : [''],
        cost: productCost,
      })
      setImagePreview(product.imageUrl || product.imageUrls?.[0] || '')
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
          // Use direct file upload to server instead of signed URLs
          const uploadFormData = new FormData();
          uploadFormData.append('image', imageFile);
          
          const response = await fetch(
            `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/upload/product`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: uploadFormData
            }
          );
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || 'Upload failed');
          }
          
          const uploadResult = await response.json();
          const uploadData = uploadResult.data || uploadResult;
          imageUrl = uploadData.imageUrl || uploadData.url;

        } catch (uploadError) {
          console.error('Upload error:', uploadError);
          setError('Failed to upload image: ' + uploadError.message);
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
        actualPrice: parseFloat(formData.actualPrice) || parseFloat(formData.price) || 0,
        baseDiscount: parseFloat(formData.baseDiscount) || 0,
        extraDiscount: parseFloat(formData.extraDiscount) || 0,
        discountedPrice: parseFloat(formData.discountedPrice) || 0,
        discount: (parseFloat(formData.actualPrice) || 0) - (parseFloat(formData.discountedPrice) || parseFloat(formData.price) || 0),
        productionTime: formData.productionTime ? parseInt(formData.productionTime) : null,
        stockQty: formData.stockQty ? parseInt(formData.stockQty) : null,
        features: formData.features.filter(f => f), // Remove empty features
        cost: {
            material: parseFloat(formData.cost.material) || 0,
            time: parseFloat(formData.cost.time) || 0,
            finishing: parseFloat(formData.cost.finishing) || 0,
        }
      };
      
      // Remove empty optional fields
      if (!productData.priceTier) delete productData.priceTier;
      if (!productData.difficulty) delete productData.difficulty;
      if (!productData.subCategory) delete productData.subCategory;
      if (!productData.productionTime) delete productData.productionTime;
      
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

              {/* Pricing & Cost */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Cost Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <CostInput label="Material Cost" name="material" value={formData.cost.material} onChange={handleCostChange} />
                      <CostInput label="Time Cost" name="time" value={formData.cost.time} onChange={handleCostChange} />
                      <CostInput label="Finishing Cost" name="finishing" value={formData.cost.finishing} onChange={handleCostChange} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-blue-50 p-2 rounded-md">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span>Costs are for your reference. Set actual selling prices below.</span>
                  </div>
              </div>

              {/* Pricing & Discount */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-slate-800 mb-3">Pricing & Discount</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CostInput 
                        label="Actual Price (MRP)" 
                        name="actualPrice" 
                        value={formData.actualPrice} 
                        onChange={(e) => setFormData({ ...formData, actualPrice: e.target.value })} 
                      />
                      <div>
                        <label className="label">Price Tier</label>
                        <CreatableDropdown
                          label=""
                          name="priceTier"
                          value={formData.priceTier}
                          options={dropdownOptions.priceTier}
                          onChange={(e) => setFormData({ ...formData, priceTier: e.target.value })}
                          onCreateNew={handleCreateNewOption}
                          placeholder="Select tier"
                        />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <PercentInput 
                        label="Base Discount" 
                        name="baseDiscount" 
                        value={formData.baseDiscount} 
                        onChange={(e) => setFormData({ ...formData, baseDiscount: e.target.value })} 
                      />
                      <PercentInput 
                        label="Extra Discount" 
                        name="extraDiscount" 
                        value={formData.extraDiscount} 
                        onChange={(e) => setFormData({ ...formData, extraDiscount: e.target.value })} 
                      />
                      <div>
                        <label className="label">Discounted Price (₹)</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <span className="text-green-600 font-bold sm:text-sm">₹</span>
                            </div>
                            <input 
                                type="number" 
                                value={formData.discountedPrice} 
                                onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                                className="input pl-7 bg-green-100 font-bold text-green-700" 
                                placeholder="Auto or manual"
                            />
                        </div>
                      </div>
                  </div>
                  {formData.actualPrice && formData.discountedPrice && (
                    <div className="mt-3 p-2 bg-green-100 rounded-md text-sm text-green-700">
                      <strong>You Save:</strong> ₹{(parseFloat(formData.actualPrice) - parseFloat(formData.discountedPrice)).toFixed(2)} 
                      ({((parseFloat(formData.baseDiscount) || 0) + (parseFloat(formData.extraDiscount) || 0)).toFixed(0)}% off)
                    </div>
                  )}
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
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
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
              
              {/* Category */}
              <CreatableDropdown
                label="Category"
                name="category"
                value={formData.category}
                options={dropdownOptions.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                onCreateNew={handleCreateNewOption}
                placeholder="Select category"
              />

              {/* Sub-Category */}
              <CreatableDropdown
                label="Sub-Category"
                name="subCategory"
                value={formData.subCategory}
                options={dropdownOptions.subCategory}
                onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                onCreateNew={handleCreateNewOption}
                placeholder="Select sub-category"
              />

              {/* Tags */}
              <div>
                <label className="label">Tags</label>
                <input type="text" value={tagsInput} onChange={handleTagsChange} className="input" placeholder="onepiece, naruto, keychain" />
                <p className="text-xs text-slate-500 mt-1">Comma-separated values.</p>
              </div>

              {/* Production Details */}
              <div className="grid grid-cols-2 gap-4">
                <CreatableDropdown
                  label="Difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  options={dropdownOptions.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  onCreateNew={handleCreateNewOption}
                  placeholder="Select"
                />
                <div>
                  <label className="label">Prod. Time (days)</label>
                  <input type="number" min="0" value={formData.productionTime} onChange={(e) => setFormData({ ...formData, productionTime: e.target.value })} className="input" placeholder="Optional" />
                </div>
              </div>

              {/* Stock & Status */}
              <div>
                  <label className="label">Stock Quantity</label>
                  <input type="number" min="0" value={formData.stockQty} onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })} className="input" placeholder="Optional" />
              </div>
              
              {/* Toggles */}
              <div className="space-y-3 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500" />
                    <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active (visible on store)</label>
                </div>
                <div className="flex items-center gap-3">
                    <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} className="w-4 h-4 text-secondary-600 border-slate-300 rounded focus:ring-secondary-500" />
                    <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700">Featured Product</label>
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
