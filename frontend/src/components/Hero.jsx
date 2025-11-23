import { MessageCircle } from 'lucide-react'
import { openWhatsApp, formatInquiryMessage } from '../utils/whatsapp'

export default function Hero() {
  const handleWhatsAppClick = () => {
    const message = formatInquiryMessage(
      'General Inquiry',
      'Hi! I visited your website and would like to know more about your services.'
    )
    openWhatsApp(message)
  }

  return (
    <section className="bg-slate-900 text-white py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-primary-600/20 text-primary-400 rounded-full text-sm font-medium mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
            Now Open at Suresh Singh Chowk
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 animate-slide-up">
            PRINT. STICK.{' '}
            <span className="text-primary-600">CREATE.</span>
          </h1>

          {/* Subtext */}
          <p className="text-xl md:text-2xl text-slate-300 mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Flip Names, Moon Lamps & Divine Idols
          </p>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Custom 3D printing, premium stickers, and professional printing services. 
            Transform your ideas into reality with cutting-edge technology and craftsmanship.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleWhatsAppClick}
            className="btn btn-primary text-lg px-8 py-4 animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Order on WhatsApp
          </button>

          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-slate-400 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Custom Designs
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Fast Delivery
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Premium Quality
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary-600/10 to-transparent pointer-events-none"></div>
    </section>
  )
}
