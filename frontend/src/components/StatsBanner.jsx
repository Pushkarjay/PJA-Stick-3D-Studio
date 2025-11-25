export default function StatsBanner({ stats: statsData }) {
  const defaultStats = [
    { label: 'Happy Customers', value: '500+' },
    { label: 'Projects Completed', value: '1000+' },
    { label: 'Custom Designs', value: '250+' },
    { label: 'Delivery Time', value: '24-48h' },
  ];

  const stats = statsData && statsData.length > 0 ? statsData : defaultStats;

  return (
    <section className="bg-white py-12 border-y border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-3xl md:text-4xl font-display font-bold text-slate-900 mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-slate-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
