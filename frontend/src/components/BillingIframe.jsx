import { useState, useEffect } from 'react'
import { ExternalLink, Save } from 'lucide-react'

export default function BillingIframe({ user }) {
  const [billingUrl, setBillingUrl] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBillingSettings()
    }
  }, [user])

  const fetchBillingSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setBillingUrl(data.billingUrl || '')
      setCustomUrl(data.billingUrl || '')
    } catch (error) {
      console.error('Error fetching billing settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!customUrl) return

    setSaving(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ billingUrl: customUrl })
      })

      if (res.ok) {
        setBillingUrl(customUrl)
        alert('Billing URL updated successfully')
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to update billing URL')
      }
    } catch (error) {
      alert('Error updating billing URL')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-slate-900 mb-4">Billing & Invoicing</h2>

      {/* URL Configuration */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Billing Dashboard URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="input flex-1"
            placeholder="https://billing.yourcompany.com/dashboard"
          />
          <button
            onClick={handleSave}
            disabled={saving || !customUrl}
            className="btn btn-primary"
          >
            {saving ? (
              <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Enter the URL to your billing/invoicing dashboard (e.g., Stripe, Razorpay, or custom solution)
        </p>
      </div>

      {/* Billing Dashboard Iframe */}
      {billingUrl ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-700">Embedded Billing Dashboard</h3>
            <a
              href={billingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Open in new tab
            </a>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <iframe
              src={billingUrl}
              className="w-full h-[600px]"
              title="Billing Dashboard"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <p className="text-slate-600">No billing URL configured yet.</p>
          <p className="text-sm text-slate-500 mt-2">Enter a billing dashboard URL above to embed it here.</p>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="https://dashboard.stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="card hover:shadow-lg transition-shadow text-center"
        >
          <h4 className="font-semibold text-slate-900 mb-1">Stripe Dashboard</h4>
          <p className="text-xs text-slate-600">Manage payments & invoices</p>
        </a>
        <a
          href="https://dashboard.razorpay.com"
          target="_blank"
          rel="noopener noreferrer"
          className="card hover:shadow-lg transition-shadow text-center"
        >
          <h4 className="font-semibold text-slate-900 mb-1">Razorpay Dashboard</h4>
          <p className="text-xs text-slate-600">Indian payment gateway</p>
        </a>
        <a
          href="https://console.cloud.google.com/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="card hover:shadow-lg transition-shadow text-center"
        >
          <h4 className="font-semibold text-slate-900 mb-1">GCP Billing</h4>
          <p className="text-xs text-slate-600">Cloud infrastructure costs</p>
        </a>
      </div>
    </div>
  )
}
