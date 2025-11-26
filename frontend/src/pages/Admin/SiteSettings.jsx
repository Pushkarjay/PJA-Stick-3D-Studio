import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { Save, Loader, Image as ImageIcon, Info, Upload } from 'lucide-react';

const Section = ({ title, description, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <h3 className="text-lg font-semibold text-slate-800 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 mb-4">{description}</p>}
    <div className="space-y-4">{children}</div>
  </div>
);

const Input = ({ label, name, value, onChange, placeholder, type = 'text' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="input"
    />
  </div>
);

const TextArea = ({ label, name, value, onChange, placeholder, rows = 3 }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <textarea
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="input"
      />
    </div>
  );

const ImageUploadField = ({ label, name, imageUrl, onUpload, uploading }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <div className="mt-1 flex items-center gap-4">
      <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border">
        {imageUrl ? (
          <img src={imageUrl} alt={label} className="w-full h-full object-contain" />
        ) : (
          <ImageIcon className="w-8 h-8 text-slate-400" />
        )}
      </div>
      <div className="flex-1">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(e, name)}
          disabled={uploading}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50"
        />
        {uploading && <p className="text-xs text-slate-500 mt-1">Uploading...</p>}
      </div>
    </div>
  </div>
);

export default function SiteSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const { data } = await apiRequest('/api/settings/admin', {}, token);
      setSettings(data || {});
    } catch (error) {
      toast.error('Failed to load site settings.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    if (keys.length > 1) {
      setSettings(prev => {
        const newSettings = { ...prev };
        let current = newSettings;
        for (let i = 0; i < keys.length - 1; i++) {
          current[keys[i]] = current[keys[i]] || {};
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        return newSettings;
      });
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const token = await user.getIdToken();
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/upload/product`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        }
      );
      
      if (!response.ok) throw new Error('Upload failed');
      
      const result = await response.json();
      const imageUrl = result.data?.imageUrl || result.data?.url;
      
      // Update the settings with the new image URL
      const keys = fieldName.split('.');
      if (keys.length > 1) {
        setSettings(prev => {
          const newSettings = { ...prev };
          let current = newSettings;
          for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = current[keys[i]] || {};
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = imageUrl;
          return newSettings;
        });
      } else {
        setSettings(prev => ({ ...prev, [fieldName]: imageUrl }));
      }
      
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      await apiRequest('/api/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(settings),
      }, token);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-full">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Site Settings</h1>
          <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
            {saving ? <Loader className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </button>
        </div>

        <div className="space-y-6">
          <Section title="Branding & Logos" description="Upload your brand logos. These will be displayed across the site.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ImageUploadField 
                label="Main Logo (PJA3D)" 
                name="logos.main" 
                imageUrl={settings.logos?.main} 
                onUpload={handleImageUpload}
                uploading={uploading}
              />
              <ImageUploadField 
                label="Legacy Logo (Kit Print)" 
                name="logos.kitPrint" 
                imageUrl={settings.logos?.kitPrint} 
                onUpload={handleImageUpload}
                uploading={uploading}
              />
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-amber-50 p-2 rounded-md">
              <Info className="w-4 h-4 text-amber-500" />
              <span>After uploading, save changes and the logos will appear on the site. Use PNG format with transparent background for best results.</span>
            </div>
          </Section>

          <Section title="Homepage Banner" description="Content for the main banner on the homepage.">
            <Input label="Main Headline" name="banner.title" value={settings.banner?.title} onChange={handleInputChange} placeholder="e.g., Print Stick Create" />
            <TextArea label="Sub-headline" name="banner.subtitle" value={settings.banner?.subtitle} onChange={handleInputChange} placeholder="Your one-stop shop for custom prints." />
            <Input label="Banner Image URL" name="banner.imageUrl" value={settings.banner?.imageUrl} onChange={handleInputChange} placeholder="https://example.com/image.jpg" />
          </Section>

          <Section title="Statistics Section" description="Counters displayed on the homepage.">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input label="Happy Customers" name="stats.happyCustomers" value={settings.stats?.happyCustomers} onChange={handleInputChange} type="number" />
                <Input label="Projects Completed" name="stats.projectsCompleted" value={settings.stats?.projectsCompleted} onChange={handleInputChange} type="number" />
                <Input label="Customer Designs" name="stats.customerDesigns" value={settings.stats?.customerDesigns} onChange={handleInputChange} type="number" />
            </div>
            <Input label="Delivery Time Text" name="stats.deliveryTime" value={settings.stats?.deliveryTime} onChange={handleInputChange} placeholder="e.g., 2-3 business days" />
          </Section>

          <Section title="Contact & Socials" description="Contact information and social media links.">
            <Input label="WhatsApp Number" name="contact.whatsapp" value={settings.contact?.whatsapp} onChange={handleInputChange} placeholder="e.g., 911234567890" />
            <Input label="Instagram URL" name="social.instagram" value={settings.social?.instagram} onChange={handleInputChange} placeholder="https://instagram.com/username" />
            <Input label="Full Address" name="contact.address" value={settings.contact?.address} onChange={handleInputChange} placeholder="123 Main St, City, Country" />
          </Section>

          <Section title="Footer Content" description="Content displayed in the site footer.">
            <Input label="Services (comma-separated)" name="footer.services" value={settings.footer?.services} onChange={handleInputChange} placeholder="3D Printing, Custom Stickers, ..." />
            <TextArea label="Company Backstory" name="about.backstory" value={settings.about?.backstory} onChange={handleInputChange} placeholder="Our story begins..." />
          </Section>

          <Section title="Billing" description="Set the URL for the external billing system.">
            <Input label="Billing Page URL" name="billing.url" value={settings.billing?.url} onChange={handleInputChange} placeholder="https://your-billing-provider.com" />
             <div className="mt-3 flex items-center gap-2 text-sm text-slate-600 bg-blue-50 p-2 rounded-md">
                <Info className="w-4 h-4 text-blue-500" />
                <span>This URL will be embedded in an iframe on the admin billing page.</span>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
