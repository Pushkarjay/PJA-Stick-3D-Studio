import { useState, useEffect } from 'react'
import { Settings, Save } from 'lucide-react'

export default function SettingsPanel({ user }) {
  const [settings, setSettings] = useState({
    siteTitle: '',
    heroTitle: '',
    heroSubtitle: '',
    whatsappNumber: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      twitter: ''
    },
    counters: {
      happyCustomers: 0,
      projectsDone: 0,
      deliveryTime: ''
    },
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
      const response = await fetch('/api/settings')
      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage('')
    try {
      const token = await user.getIdToken()
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })
      if (response.ok) {
        setMessage('Settings saved successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('Error saving settings')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handleUpload = async (e, field) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('fieldname', field)

      const token = await user.getIdToken()
      const response = await fetch('/api/settings/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [`${field}Url`]: data.imageUrl
        }))
        setMessage('Image uploaded successfully!')
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      setMessage('Error uploading image')
    }
  }

  if (loading) return <div className="text-center py-8">Loading settings...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Site Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Footer & Contact Info */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Footer & Contact Info</h3>
                  <div>
                    <label className="block text-sm font-medium mb-1">Footer Description</label>
                    <textarea
                      value={settings.footerDescription}
                      onChange={e => setSettings({ ...settings, footerDescription: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Custom 3D printing, premium stickers, and professional printing services at Suresh Singh Chowk."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Address</label>
                    <input
                      type="text"
                      value={settings.contactAddress}
                      onChange={e => setSettings({ ...settings, contactAddress: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="Suresh Singh Chowk, [Your City]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Email</label>
                    <input
                      type="email"
                      value={settings.contactEmail}
                      onChange={e => setSettings({ ...settings, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="info@pja3dstudio.com"
                    />
                  </div>
                </div>
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Site Title</label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({...settings, siteTitle: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hero Title</label>
            <input
              type="text"
              value={settings.heroTitle}
              onChange={(e) => setSettings({...settings, heroTitle: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
            <textarea
              value={settings.heroSubtitle}
              onChange={(e) => setSettings({...settings, heroSubtitle: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Number (with country code)</label>
            <input
              type="text"
              value={settings.whatsappNumber}
              onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="916372362313"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Social Links</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Instagram URL</label>
            <input
              type="text"
              value={settings.socialLinks.instagram}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: {...settings.socialLinks, instagram: e.target.value}
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Facebook URL (optional)</label>
            <input
              type="text"
              value={settings.socialLinks.facebook}
              onChange={(e) => setSettings({
                ...settings,
                socialLinks: {...settings.socialLinks, facebook: e.target.value}
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Billing URL</label>
            <input
              type="text"
              value={settings.billingUrl}
              onChange={(e) => setSettings({...settings, billingUrl: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Counters */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Frontpage Counters</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">Happy Customers</label>
            <input
              type="number"
              value={settings.counters.happyCustomers}
              onChange={(e) => setSettings({
                ...settings,
                counters: {...settings.counters, happyCustomers: parseInt(e.target.value) || 0}
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Projects Done</label>
            <input
              type="number"
              value={settings.counters.projectsDone}
              onChange={(e) => setSettings({
                ...settings,
                counters: {...settings.counters, projectsDone: parseInt(e.target.value) || 0}
              })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Delivery Time</label>
            <input
              type="text"
              value={settings.counters.deliveryTime}
              onChange={(e) => setSettings({
                ...settings,
                counters: {...settings.counters, deliveryTime: e.target.value}
              })}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="24-48 hours"
            />
          </div>
        </div>

        {/* Image Uploads */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Images</h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">PJA 3D Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'logo')}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {settings.logoUrl && (
              <img src={settings.logoUrl} alt="Logo" className="mt-2 h-16 object-contain" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Kit Print Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'logoKitPrint')}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {settings.logoKitPrintUrl && (
              <img src={settings.logoKitPrintUrl} alt="Kit Print Logo" className="mt-2 h-16 object-contain" />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hero Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, 'heroImage')}
              className="w-full px-3 py-2 border rounded-lg"
            />
            {settings.heroImageUrl && (
              <img src={settings.heroImageUrl} alt="Hero" className="mt-2 w-full h-32 object-cover rounded-lg" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
