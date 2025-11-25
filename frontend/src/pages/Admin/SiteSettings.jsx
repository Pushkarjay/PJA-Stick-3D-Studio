import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../../lib/api';
import toast from 'react-hot-toast';
import { Save, Loader, Image as ImageIcon, Info } from 'lucide-react';

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

export default function SiteSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiRequest('/settings/admin');
      setSettings(data || {});
    } catch (error) {
      toast.error('Failed to load site settings.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest('/settings/admin', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
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
