import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { apiRequest } from '../lib/api'

export default function About() {
  const [footerSettings, setFooterSettings] = useState(null)

  useEffect(() => {
    fetchFooterSettings()
  }, [])

  const fetchFooterSettings = async () => {
    try {
      const response = await apiRequest('/api/settings')
      const data = response.data || response
      setFooterSettings({
        description: data.footerDescription || data.siteTitle || '',
        socialLinks: data.socialLinks || {},
        contact: {
          address: data.contactAddress || data.contact?.address || 'Suresh Singh Chowk, [Your City]',
          phone: data.whatsappNumber || data.contact?.phone || '+91 6372362313',
          email: data.contactEmail || data.contact?.email || 'info@pja3dstudio.com',
        },
      })
    } catch (e) {
      setFooterSettings(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Main About Section */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6">
                About PJA Stick & 3D Studio
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                We are a creative studio specializing in custom 3D printing, premium stickers,
                and professional printing services.
              </p>
            </div>

            {/* Our Story Section */}
            <div className="bg-gradient-to-br from-slate-50 to-primary-50 rounded-2xl p-8 md:p-12 mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📖</span> Our Story
              </h2>
              <div className="space-y-4 text-slate-700 leading-relaxed">
                <p>
                  <strong className="text-primary-600">Earlier we were Kit Print</strong>, launched at KIT University 
                  where we saw an amazing response from students and faculty. What started as a small venture 
                  to provide custom printing solutions quickly grew into something much bigger.
                </p>
                <p>
                  The overwhelming support and demand from our customers inspired us to think bigger. 
                  We decided to <strong className="text-primary-600">expand to an All India level</strong> and 
                  rebranded ourselves as <strong className="text-primary-600">PJA3D</strong> - PJA Stick & 3D Studio.
                </p>
                <p>
                  Now we're actively working on nationwide shipping and receiving orders from across India. 
                  From personalized flip names and moon lamps to divine idols and custom 3D prints, 
                  we deliver quality products that exceed expectations.
                </p>
              </div>
            </div>

            {/* Legacy Section */}
            <div className="flex items-center justify-center gap-8 mb-12 p-6 bg-slate-100 rounded-xl">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">A legacy of</p>
                <img src="/assets/logos/kit-print-logo.png" alt="Kit Print Logo" className="h-12 mx-auto" />
              </div>
              <div className="text-3xl text-slate-400">→</div>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-2">Now evolved to</p>
                <img src="/assets/logos/logo.png" alt="PJA3D Logo" className="h-12 mx-auto" />
              </div>
            </div>

            {/* Services Grid */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">What We Offer</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: '🖨️', title: '3D Printing', desc: 'Custom 3D printed items' },
                  { icon: '🏷️', title: 'Stickers', desc: 'Premium quality stickers' },
                  { icon: '📄', title: 'Printing', desc: 'Professional printing services' },
                  { icon: '📸', title: 'Polaroid Photos', desc: 'Instant photo prints' },
                  { icon: '🎨', title: 'Custom Designs', desc: 'Personalized creations' },
                  { icon: '📦', title: 'Bulk Orders', desc: 'Large quantity orders' },
                ].map((service, index) => (
                  <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center hover:shadow-md transition-shadow">
                    <span className="text-3xl mb-2 block">{service.icon}</span>
                    <h3 className="font-semibold text-slate-900">{service.title}</h3>
                    <p className="text-sm text-slate-500">{service.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center bg-primary-600 text-white rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4">Ready to Create Something Amazing?</h2>
              <p className="mb-6 text-primary-100">
                Order today via WhatsApp for fast and convenient service!
              </p>
              <a 
                href={`https://wa.me/${footerSettings?.contact?.phone?.replace(/[^0-9]/g, '') || '916372362313'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
              >
                <span>💬</span> Order on WhatsApp
              </a>
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
