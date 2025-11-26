import ProductCard from './ProductCard'
import { FileText } from 'lucide-react'

export default function ProductsGrid({ products, loading, onProductClick, showCustomCta, whatsAppNumber }) {
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-16">
          <svg
            className="w-24 h-24 mx-auto text-slate-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">No products found</h3>
          <p className="text-slate-600">Try adjusting your filters or search terms</p>
        </div>
      </div>
    )
  }

  const CustomOrderCard = () => (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-dashed border-primary-400 bg-primary-50/50 shadow-sm transition-all hover:shadow-lg hover:border-primary-500 hover:bg-primary-50">
      <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-primary-100 p-4">
          <FileText className="h-10 w-10 text-primary-600" />
        </div>
        <h3 className="font-semibold text-lg text-primary-800 mb-2">
          Can't Find What You Need?
        </h3>
        <p className="text-sm text-primary-700 mb-4">
          We create custom products tailored to your needs. Share your idea and get a quote!
        </p>
        <a
          href={`https://wa.me/${whatsAppNumber || '916372362313'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary rounded-full"
        >
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );


  return (
    <section id="products" className="py-12 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
            Our Products
          </h2>
          <p className="text-slate-600">
            Explore our collection of custom 3D prints, stickers, and printing services
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {showCustomCta && <CustomOrderCard />}
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              style={{ animationDelay: `${index * 0.05}s` }}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
