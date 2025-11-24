import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'

export default function Contact() {
  const [footerSettings, setFooterSettings] = useState(null)

  useEffect(() => {
    fetchFooterSettings()
  }, [])

  const fetchFooterSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      const data = await res.json()
      setFooterSettings({
        description: data.footerDescription || data.siteTitle || '',
        socialLinks: data.socialLinks || {},
        contact: {
          address: data.contactAddress || 'Suresh Singh Chowk, [Your City]',
          phone: data.whatsappNumber || '+91 6372362313',
          email: data.contactEmail || 'info@pja3dstudio.com',
        },
      })
    } catch (e) {
      setFooterSettings(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
              Get in Touch
            </h2>
            <p className="text-slate-600 mb-8">
              Have questions or special requests? We'd love to hear from you!
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card text-left">
                <h3 className="font-semibold text-lg mb-3">Visit Us</h3>
                <p className="text-slate-600">
                  Suresh Singh Chowk<br />
                  [Your City, State]<br />
                  [Pincode]
                </p>
              </div>
              <div className="card text-left">
                <h3 className="font-semibold text-lg mb-3">Contact</h3>
                <p className="text-slate-600">
                  Phone: +91 6372362313<br />
                  Email: info@pja3dstudio.com<br />
                  WhatsApp: Available 24/7
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer
        description={footerSettings?.description}
        socialLinks={footerSettings?.socialLinks}
        contact={footerSettings?.contact}
      />
    </div>
  )
}
