import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Instagram, MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiRequest } from '../lib/api'

export default function Footer({
  description = 'Custom 3D printing, premium stickers, and professional printing services at Suresh Singh Chowk.',
  socialLinks = {
    instagram: 'https://instagram.com',
    whatsapp: 'https://wa.me/916372362313',
  },
  contact = {
    address: 'Suresh Singh Chowk, [Your City]',
    phone: '+91 6372362313',
    email: '',
  },
}) {
  const currentYear = new Date().getFullYear()
  const [logos, setLogos] = useState({ main: null, kitPrint: null })

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await apiRequest('/api/settings')
        const data = response.data || response
        setLogos({
          main: data.logos?.main,
          kitPrint: data.logos?.kitPrint
        })
      } catch (e) {
        // Use defaults if settings fail
      }
    }
    fetchLogos()
  }, [])

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="block">
              {logos.main ? (
                <img src={logos.main} alt="PJA3D Logo" className="h-10" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <span className="text-2xl font-bold text-white">PJA3D</span>
              )}
            </Link>
            <p className="text-slate-400 text-sm">
              {description}
            </p>
            <div className="flex gap-3">
              {socialLinks?.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socialLinks?.whatsapp && (
                <a
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
              )}
            </div>
            <div className="pt-4">
              <h4 className="text-xs font-semibold tracking-wider text-slate-500 uppercase">A legacy of:</h4>
              {logos.kitPrint ? (
                <img src={logos.kitPrint} alt="Kit Print Logo" className="h-8 mt-2" onError={(e) => { e.target.style.display = 'none'; }} />
              ) : (
                <span className="text-sm text-slate-400 mt-2 block">Kit Print</span>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>
                <Link to="/" className="hover:text-primary-600 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-primary-600 transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-primary-600 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li>3D Printing</li>
              <li>Custom Stickers</li>
              <li>Professional Printing</li>
              <li>Polaroid Photos</li>
              <li>Custom Designs</li>
              <li>Bulk Orders</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{contact?.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href={`tel:${contact?.phone?.replace(/\s+/g, '')}`} className="hover:text-primary-600 transition-colors">
                  {contact?.phone}
                </a>
              </li>
              {contact?.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <a href={`mailto:${contact.email}`} className="hover:text-primary-600 transition-colors">
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <p>© {currentYear} PJA Stick & 3D Studio. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary-600 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-primary-600 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
