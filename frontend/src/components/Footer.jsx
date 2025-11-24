import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Facebook, Instagram, MessageCircle } from 'lucide-react'

export default function Footer({
  description = 'Custom 3D printing, premium stickers, and professional printing services at Suresh Singh Chowk.',
  socialLinks = {
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    whatsapp: 'https://wa.me/916372362313',
  },
  contact = {
    address: 'Suresh Singh Chowk, [Your City]',
    phone: '+91 6372362313',
    email: 'info@pja3dstudio.com',
  },
}) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="text-2xl font-display font-bold">
              PJA<span className="text-primary-600">3D</span>
            </div>
            <p className="text-slate-400 text-sm">
              {description}
            </p>
            <div className="flex gap-3">
              <a
                href={socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-primary-600 rounded-lg transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
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
                <a href="#products" className="hover:text-primary-600 transition-colors">
                  Products
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-primary-600 transition-colors">
                  About Us
                </a>
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
              <li>Flip Names</li>
              <li>Moon Lamps</li>
              <li>Divine Idols</li>
              <li>Professional Printing</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{contact.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <a href={`tel:${contact.phone.replace(/\s+/g, '')}`} className="hover:text-primary-600 transition-colors">
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <a href={`mailto:${contact.email}`} className="hover:text-primary-600 transition-colors">
                  {contact.email}
                </a>
              </li>
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
