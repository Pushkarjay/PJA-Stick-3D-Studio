import { useState, useEffect, useCallback } from 'react';
import { ExternalLink, Save, AlertTriangle, Loader } from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

export default function BillingIframe() {
  const { user } = useAuth();
  const [billingUrl, setBillingUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBillingUrl = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const { data } = await apiRequest('/api/settings/admin', {}, token);
      const url = data?.billing?.url;
      if (url) {
        setBillingUrl(url);
      } else {
        setError('Billing URL is not configured in the site settings.');
      }
    } catch (err) {
      toast.error('Could not fetch billing settings.');
      console.error('Error fetching billing settings:', err);
      setError('Failed to load billing configuration.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBillingUrl();
  }, [fetchBillingUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
        <p className="ml-4 text-slate-600">Loading Billing Configuration...</p>
      </div>
    );
  }

  if (error) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6 m-6">
            <div className="bg-red-50 border-2 border-dashed border-red-200 rounded-lg p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-red-400" />
                <h3 className="mt-4 text-lg font-semibold text-red-800">Billing Configuration Error</h3>
                <p className="text-sm text-red-600 mt-2">{error}</p>
                <p className="text-xs text-slate-500 mt-4">
                    Please configure the billing URL in the <a href="/admin/settings/site" className="font-medium underline">Site Settings</a> page.
                </p>
            </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 m-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900">Billing & Invoicing</h2>
        <a
            href={billingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-outline"
        >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in new tab
        </a>
      </div>
      
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
        <iframe
          src={billingUrl}
          className="w-full h-[75vh]"
          title="Billing Dashboard"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
