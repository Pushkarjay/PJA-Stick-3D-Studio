import { useState, useEffect } from 'react'
import { Settings, Save, Image as ImageIcon, Link as LinkIcon, Hash, Building } from 'lucide-react'
import { apiRequest } from '../../lib/api'

const Section = ({ title, icon, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-md">
    <h3 className="text-xl font-semibold flex items-center gap-3 mb-4 text-slate-800">
      {icon}
      {title}
    </h3>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InputField = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="label">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="input"
      placeholder={placeholder}
    />
  </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label htmlFor={name} className="label">{label}</label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="input"
      placeholder={placeholder}
      rows={rows}
    />
  </div>
);

const ImageUploadField = ({ label, name, imageUrl, onUpload }) => (
  <div>
    <label className="label">{label}</label>
    <div className="mt-1 flex items-center gap-4">
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border">
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <ImageIcon className="w-8 h-8 text-slate-400" />
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => onUpload(e, name)}
        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
      />
    </div>
  </div>
);


export default function SettingsPanel({ user }) {
  const [settings, setSettings] = useState({
    siteTitle: '',
    heroTitle: '',
    heroSubtitle: '',
    whatsappNumber: '',
    socialLinks: { instagram: '', facebook: '', twitter: '' },
    counters: { happyCustomers: 0, projectsDone: 0, deliveryTime: '' },
    billingUrl: '',
    logoUrl: '',
    logoKitPrintUrl: '',
    heroImageUrl: '',
    footerDescription: '',
    contactAddress: '',
    contactEmail: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await apiRequest('/api/settings')
      const data = response.data || response;
      if (data) {
        // Ensure all nested objects exist to prevent errors
        setSettings({
          ...data,
          socialLinks: data.socialLinks || { instagram: '', facebook: '', twitter: '' },
          counters: data.counters || { happyCustomers: 0, projectsDone: 0, deliveryTime: '' },
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage('Failed to load settings.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const token = await user.getIdToken()
      await apiRequest('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setMessage('Settings saved successfully!')
    } catch (error) {
      setMessage(`Error saving settings: ${error.message}`)
    } finally {
      setSaving(false)
      setTimeout(() => setMessage(''), 4000)
    }
  }

  const handleUpload = async (e, fieldName) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('fieldname', fieldName)

      const token = await user.getIdToken()
      const response = await apiRequest('/api/settings/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = response.data || response;

      if (data.imageUrl) {
        setSettings(prev => ({ ...prev, [`${fieldName}Url`]: data.imageUrl }))
        setMessage('Image uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage(`Error uploading image: ${error.message}`)
    } finally {
      setTimeout(() => setMessage(''), 4000)
    }
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (parent, e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [name]: value
      }
    }));
  };

  if (loading) return <div className="flex justify-center items-center h-64"><div className="spinner"></div></div>

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Site Settings</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg text-sm ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Section title="Basic Information" icon={<Settings className="w-6 h-6 text-primary-600" />}>
            <InputField label="Site Title" name="siteTitle" value={settings.siteTitle} onChange={handleChange} placeholder="PJA 3D Studio" />
            <InputField label="Hero Title" name="heroTitle" value={settings.heroTitle} onChange={handleChange} placeholder="Bring Your Ideas to Life" />
            <TextareaField label="Hero Subtitle" name="heroSubtitle" value={settings.heroSubtitle} onChange={handleChange} placeholder="Custom 3D prints, stickers, and more." />
          </Section>

          <Section title="Contact & Socials" icon={<LinkIcon className="w-6 h-6 text-primary-600" />}>
            <InputField label="WhatsApp Number" name="whatsappNumber" value={settings.whatsappNumber} onChange={handleChange} placeholder="+911234567890" />
            <InputField label="Instagram URL" name="instagram" value={settings.socialLinks.instagram} onChange={(e) => handleNestedChange('socialLinks', e)} placeholder="https://instagram.com/..." />
            <InputField label="Facebook URL" name="facebook" value={settings.socialLinks.facebook} onChange={(e) => handleNestedChange('socialLinks', e)} placeholder="https://facebook.com/..." />
          </Section>
          
          <Section title="Footer & Contact Info" icon={<Building className="w-6 h-6 text-primary-600" />}>
            <TextareaField label="Footer Description" name="footerDescription" value={settings.footerDescription} onChange={handleChange} />
            <InputField label="Contact Address" name="contactAddress" value={settings.contactAddress} onChange={handleChange} />
            <InputField label="Contact Email" name="contactEmail" value={settings.contactEmail} onChange={handleChange} type="email" />
          </Section>
        </div>

        <div className="space-y-8">
          <Section title="Site Images" icon={<ImageIcon className="w-6 h-6 text-primary-600" />}>
            <ImageUploadField label="Main Logo" name="logo" imageUrl={settings.logoUrl} onUpload={handleUpload} />
            <ImageUploadField label="Legacy 'Kit Print' Logo" name="logoKitPrint" imageUrl={settings.logoKitPrintUrl} onUpload={handleUpload} />
            <ImageUploadField label="Hero Section Image" name="heroImage" imageUrl={settings.heroImageUrl} onUpload={handleUpload} />
          </Section>

          <Section title="Homepage Counters" icon={<Hash className="w-6 h-6 text-primary-600" />}>
            <InputField label="Happy Customers" name="happyCustomers" value={settings.counters.happyCustomers} onChange={(e) => handleNestedChange('counters', e)} type="number" />
            <InputField label="Projects Done" name="projectsDone" value={settings.counters.projectsDone} onChange={(e) => handleNestedChange('counters', e)} type="number" />
            <InputField label="Delivery Time Text" name="deliveryTime" value={settings.counters.deliveryTime} onChange={(e) => handleNestedChange('counters', e)} placeholder="e.g., 24-48 Hours" />
          </Section>
          
          <Section title="Advanced" icon={<Settings className="w-6 h-6 text-primary-600" />}>
             <InputField label="Billing URL" name="billingUrl" value={settings.billingUrl} onChange={handleChange} placeholder="https://your-billing-url.com" />
          </Section>
        </div>
      </div>
    </div>
  )
}
