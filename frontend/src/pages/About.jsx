import NavBar from '../components/NavBar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'

export default function About() {
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
      <main className="flex-1 py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-slate-900 mb-4">
              About PJA Stick & 3D Studio
            </h2>
            <p className="text-slate-600 mb-6">
              We are a creative studio specializing in custom 3D printing, premium stickers,
              and professional printing services. Located at Suresh Singh Chowk, we bring
              your ideas to life with cutting-edge technology and expert craftsmanship.
            </p>
            <p className="text-slate-600">
              From personalized flip names and moon lamps to divine idols and custom
              designs, we deliver quality products that exceed expectations. Order today
              via WhatsApp for fast and convenient service!
            </p>
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
