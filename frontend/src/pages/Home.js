import React from 'react';
import { Link } from 'react-router-dom';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from '../components/GlassCard';
import CategoryImage from '../components/CategoryImage';

/**
 * Home page with hero section and glassmorphism styling
 * Implements Requirements 1.1, 2.1, 2.2, 2.3
 */
const Home = () => {
  const { breakpoint } = useBreakpoint();

  const features = [
    {
      icon: (
        <img 
          src="/quality_medication.jpg" 
          alt="Quality medications" 
          className="w-full h-full object-cover rounded-full"
        />
      ),
      title: 'Quality Medications',
      description: 'Authentic pharmaceuticals from trusted manufacturers with proper storage and handling.'
    },
    {
      icon: (
        <img 
          src="/expert_consultations.png" 
          alt="Expert consultations" 
          className="w-full h-full object-cover rounded-full"
        />
      ),
      title: 'Expert Consultations',
      description: 'Professional pharmacist consultations for medication guidance and health advice.'
    },
    {
      icon: (
        <img 
          src="/fast_delivery.png" 
          alt="Fast delivery" 
          className="w-full h-full object-cover rounded-full"
        />
      ),
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery service to get your medications when you need them.'
    }
  ];

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8 md:p-12 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 text-gray-800 dark:text-white">
              Order Medicines Online in Kenya
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8">
              Fast Delivery • Genuine Medicines • Licensed Pharmacy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                to="/products"
                className="glass-button-primary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                <img 
                  src="/cart.png" 
                  alt="Shopping cart" 
                  className="w-5 h-5 mr-2 object-contain"
                />
                Shop Medicines
              </Link>
              <Link
                to="/upload-prescription"
                className="glass-button-secondary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                <svg className="w-5 h-5 mr-2 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Upload Prescription
              </Link>
            </div>
            
            {/* Trust Signals */}
            <div className={`grid gap-6 mt-8 ${
              breakpoint === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
            }`}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mb-2 shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
                  <img 
                    src="/fast_delivery.png" 
                    alt="Same day delivery" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Same Day Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-glass-blue to-glass-blue-dark rounded-full flex items-center justify-center mb-2 shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">100% Genuine Medicines</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-glass-blue-dark to-glass-blue rounded-full flex items-center justify-center mb-2 shadow-lg">
                  <img 
                    src="/pharmacist_support.png" 
                    alt="Pharmacist support" 
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pharmacist Support</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-glass-green-dark to-glass-green rounded-full flex items-center justify-center mb-2 shadow-lg overflow-hidden">
                  <img 
                    src="/mpesa.png" 
                    alt="Pay via Mpesa / Card" 
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pay via Mpesa / Card</span>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Shop by Category Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Find the right medicine for your health needs
            </p>
          </div>
          <div className={`grid gap-6 ${
            breakpoint === 'mobile' ? 'grid-cols-2' :
            breakpoint === 'tablet' ? 'grid-cols-3' : 'grid-cols-4'
          }`}>
            {[
              { name: 'Pain Relief', image: '/pain_relief.png', link: '/products?category=pain-relief', fallback: '🩹' },
              { name: 'Cough & Flu', image: '/cough_&_flu.png', link: '/products?category=cough-flu', fallback: '🤧' },
              { name: 'Vitamins & Supplements', image: '/vitamins_&_supplements.png', link: '/supplements', fallback: '💊' },
              { name: 'Skin Care', image: '/skin_care.png', link: '/personal-care?category=skin-care', fallback: '🧴' },
              { name: 'Baby Care', image: '/baby_care.png', link: '/products?category=baby-care', fallback: '👶' },
              { name: 'Women\'s Health', image: '/womens_health.png', link: '/products?category=womens-health', fallback: '👩' },
              { name: 'Diabetes', image: '/diabetis.png', link: '/products?category=diabetes', fallback: '🩺' },
              { name: 'Digestive Health', image: '/digestive_health.png', link: '/products?category=digestive', fallback: '🫁' }
            ].map((category, index) => (
              <Link key={index} to={category.link}>
                <div className="text-center hover:scale-105 transition-all duration-300 group">
                  {/* Image with Glass Card */}
                  <GlassCard className="p-1 mb-2 mx-6 hover:shadow-lg transition-all duration-300" hover>
                    <div className="relative h-40 md:h-44">
                      <CategoryImage
                        src={category.image}
                        alt={`${category.name} medicines and products`}
                        className="w-full h-full object-cover rounded-lg filter group-hover:scale-105 transition-transform duration-300"
                        fallbackIcon={category.fallback}
                      />
                    </div>
                  </GlassCard>
                  
                  {/* Category Name - No Card Background */}
                  <div className="px-2">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white group-hover:text-glass-blue dark:group-hover:text-glass-blue-light transition-colors duration-300 text-center leading-tight">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Quality Medicines and Healthcare Products
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our experienced pharmacists are committed to helping patients manage their medications safely while offering guidance on treatment options and general health concerns.
            </p>
          </div>
          <div className={`grid gap-6 ${
            breakpoint === 'mobile' ? 'grid-cols-1' :
            breakpoint === 'tablet' ? 'grid-cols-2' : 'grid-cols-3'
          }`}>
            {features.map((feature, index) => (
              <GlassCard key={index} className="p-6 text-center" hover>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden ${
                  ['Fast Delivery', 'Expert Consultations', 'Quality Medications'].includes(feature.title)
                    ? 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-600' 
                    : 'bg-gradient-to-br from-glass-blue to-glass-green'
                }`}>
                  {feature.icon}
                </div>
                <h3 className="text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Legitimacy Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Licensed & Trusted Pharmacy
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Your health and safety are our top priorities
              </p>
            </div>
            
            <div className={`grid gap-6 ${
              breakpoint === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'
            }`}>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-glass-green to-glass-green-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Licensed by PPB</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Pharmacy & Poisons Board Licensed<br/>
                  License No: PPB/PH/01/2024/001
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-glass-blue to-glass-blue-dark rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  SSL Encrypted Transactions<br/>
                  Mpesa, Visa, Mastercard
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-glass-blue-dark to-glass-green rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Physical Location</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Ruaraka, Nairobi<br/>
                  Phone: +254 700 123 456
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8 mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">Our Health Services</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Professional healthcare services delivered with care
            </p>
          </GlassCard>
          
          <div className={`grid gap-6 ${
            breakpoint === 'mobile' ? 'grid-cols-1' :
            breakpoint === 'tablet' ? 'grid-cols-2' : 'grid-cols-4'
          }`}>
            {[
              { 
                name: 'Pharmacist Consultation', 
                link: '/book-appointment', 
                icon: '/pharmacist_consulation.png', 
                desc: 'Expert medication advice',
                isImage: true,
                bgColor: 'from-glass-blue to-glass-green'
              },
              { 
                name: 'Prescription Refills', 
                link: '/upload-prescription', 
                icon: (
                  <svg className="w-8 h-8 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ), 
                desc: 'Easy prescription uploads',
                isImage: false,
                bgColor: 'from-glass-blue to-glass-blue-dark'
              },
              { 
                name: 'Medicine Delivery', 
                link: '/products', 
                icon: '/fast_delivery.png', 
                desc: 'Same day delivery in Nairobi',
                isImage: true,
                bgColor: 'from-glass-blue to-glass-green'
              },
              { 
                name: 'Health Advice', 
                link: '/contact', 
                icon: (
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), 
                desc: 'Professional health guidance',
                isImage: false,
                bgColor: 'from-green-100 to-green-200 dark:from-green-800 dark:to-green-700'
              }
            ].map((service, index) => (
              <Link key={index} to={service.link}>
                <GlassCard className="p-6 text-center h-full hover:scale-105 transition-all duration-300 group" hover>
                  <div className={`w-16 h-16 bg-gradient-to-br ${service.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden`}>
                    {service.isImage ? (
                      <img 
                        src={service.icon} 
                        alt={service.name} 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      service.icon
                    )}
                  </div>
                  <h3 className="text-gray-800 dark:text-white font-semibold mb-2 group-hover:text-glass-blue dark:group-hover:text-glass-blue-light transition-colors duration-300">{service.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{service.desc}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Information Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center justify-center">
                <img 
                  src="/fast_delivery.png" 
                  alt="Fast delivery" 
                  className="w-6 h-6 object-contain mr-2"
                />
                Fast Delivery Across Kenya
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Nairobi (Same Day)</span>
                  <span className="font-semibold text-gray-800 dark:text-white">KSh 200</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300">Other Towns (1-3 Days)</span>
                  <span className="font-semibold text-gray-800 dark:text-white">KSh 350</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 dark:text-green-400 font-medium">Free Delivery</span>
                    <span className="text-gray-600 dark:text-gray-400">Orders above KSh 3,000</span>
                  </div>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center justify-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.595z"/>
                </svg>
                Order via WhatsApp
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Quick and easy ordering through WhatsApp. Upload your prescription and get instant quotes.
              </p>
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2v0l7 4 7-4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Send prescription photo</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Upload clear images of your prescription</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Get instant quote</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Receive pricing and availability information</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Pay via Mpesa</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Secure payment through mobile money</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">Receive delivery</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Get your medicines delivered to your doorstep</p>
                  </div>
                </div>
              </div>
              <Link 
                to="/whatsapp-order"
                className="glass-button-primary inline-flex items-center justify-center w-full"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.595z"/>
                </svg>
                Order via WhatsApp
              </Link>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              Why Choose Esena Pharmacy
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Trusted Local Pharmacy</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  As a trusted pharmacy in Ruaraka, Nairobi, we've been serving the community for over 20 years with reliable healthcare services and quality medications.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Professional Pharmacist Consultations</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Our experienced pharmacists provide personalized medication guidance, health consultations, and ensure safe medication management for all patients.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Fast Medicine Delivery in Nairobi</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  We offer convenient home delivery services throughout Nairobi, ensuring you receive your medications quickly and safely at your doorstep.
                </p>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Quality Health Supplements</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Wide range of authentic health supplements, vitamins, and wellness products to support your overall health and wellness journey.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8">
            <div className={`grid gap-8 text-center ${
              breakpoint === 'mobile' ? 'grid-cols-2' :
              breakpoint === 'tablet' ? 'grid-cols-2' : 'grid-cols-4'
            }`}>
              <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">20+</div>
                <div className="text-gray-600 dark:text-gray-300">Years of Service</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">10K+</div>
                <div className="text-gray-600 dark:text-gray-300">Happy Customers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">500+</div>
                <div className="text-gray-600 dark:text-gray-300">Products Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-800 dark:text-white mb-2">24/7</div>
                <div className="text-gray-600 dark:text-gray-300">Customer Support</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <GlassCard className="p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
              Contact Esena Pharmacy
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our experienced pharmacists are here to help you with medication questions, 
              health consultations, and personalized care recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="glass-button-primary inline-flex items-center justify-center"
              >
                Contact Us Today
              </Link>
              <Link
                to="/track/demo"
                className="glass-button-secondary inline-flex items-center justify-center"
              >
                Track Your Order
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
};

export default Home;