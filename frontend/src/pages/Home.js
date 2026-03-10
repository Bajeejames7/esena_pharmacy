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
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
        </svg>
      ),
      title: 'Quality Medications',
      description: 'Authentic pharmaceuticals from trusted manufacturers with proper storage and handling.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: 'Expert Consultations',
      description: 'Professional pharmacist consultations for medication guidance and health advice.'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
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
                🛒 Shop Medicines
              </Link>
              <Link
                to="/upload-prescription"
                className="glass-button-secondary inline-flex items-center justify-center px-8 py-4 text-lg"
              >
                📋 Upload Prescription
              </Link>
            </div>
            
            {/* Trust Signals */}
            <div className={`grid gap-6 mt-8 ${
              breakpoint === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'
            }`}>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-glass-green rounded-full flex items-center justify-center mb-2">
                  <span className="text-white text-xl">🚚</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Same Day Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-glass-blue rounded-full flex items-center justify-center mb-2">
                  <span className="text-white text-xl">💊</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">100% Genuine Medicines</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-glass-blue-dark rounded-full flex items-center justify-center mb-2">
                  <span className="text-white text-xl">📞</span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pharmacist Support</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-glass-green-dark rounded-full flex items-center justify-center mb-2">
                  <span className="text-white text-xl">💳</span>
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
                <div className="w-16 h-16 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
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
                <div className="w-16 h-16 bg-glass-green rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🏥</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Licensed by PPB</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Pharmacy & Poisons Board Licensed<br/>
                  License No: PPB/PH/01/2024/001
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-glass-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">🔒</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Secure Payments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  SSL Encrypted Transactions<br/>
                  Mpesa, Visa, Mastercard
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-glass-blue-dark rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">📍</span>
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
              { name: 'Pharmacist Consultation', link: '/book-appointment', icon: '👨🏾‍⚕️', desc: 'Expert medication advice' },
              { name: 'Prescription Refills', link: '/upload-prescription', icon: '📋', desc: 'Easy prescription uploads' },
              { name: 'Medicine Delivery', link: '/products', icon: '🚚', desc: 'Same day delivery in Nairobi' },
              { name: 'Health Advice', link: '/contact', icon: '💬', desc: 'Professional health guidance' }
            ].map((service, index) => (
              <Link key={index} to={service.link}>
                <GlassCard className="p-6 text-center h-full" hover>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-gray-800 dark:text-white font-medium mb-2">{service.name}</h3>
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                🚚 Fast Delivery Across Kenya
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
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                📱 Order via WhatsApp
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Quick and easy ordering through WhatsApp. Upload your prescription and get instant quotes.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-3">1️⃣</span>
                  <span>Send prescription photo</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-3">2️⃣</span>
                  <span>Get instant quote</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-3">3️⃣</span>
                  <span>Pay via Mpesa</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <span className="mr-3">4️⃣</span>
                  <span>Receive delivery</span>
                </div>
              </div>
              <a 
                href="https://wa.me/254700123456" 
                target="_blank" 
                rel="noopener noreferrer"
                className="glass-button-primary inline-flex items-center justify-center w-full mt-6"
              >
                📱 Order via WhatsApp
              </a>
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