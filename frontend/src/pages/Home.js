import React from 'react';
import { Link } from 'react-router-dom';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from '../components/GlassCard';

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

  const services = [
    { name: 'Prescription Medications', link: '/products', icon: '💊' },
    { name: 'Health Supplements', link: '/supplements', icon: '🌿' },
    { name: 'Personal Care', link: '/personal-care', icon: '🧴' },
    { name: 'Health Consultations', link: '/appointments', icon: '👩‍⚕️' }
  ];

  return (
    <div className="pt-24 pb-16">
      {/* Hero Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8 md:p-12 text-center">
            <h1 className="mb-6 text-gray-800 dark:text-white">
              Welcome to Esena Pharmacy
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Your trusted healthcare partner providing quality medications, 
              professional consultations, and personalized care for your wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="glass-button-primary inline-flex items-center justify-center"
              >
                Browse Products
              </Link>
              <Link
                to="/appointments"
                className="glass-button-secondary inline-flex items-center justify-center"
              >
                Book Appointment
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
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

      {/* Services Section */}
      <section className="px-4 mb-16">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-8 mb-8 text-center">
            <h2 className="text-gray-800 dark:text-white mb-4">Our Services</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Comprehensive healthcare solutions tailored to your needs
            </p>
          </GlassCard>
          
          <div className={`grid gap-6 ${
            breakpoint === 'mobile' ? 'grid-cols-1' :
            breakpoint === 'tablet' ? 'grid-cols-2' : 'grid-cols-4'
          }`}>
            {services.map((service, index) => (
              <Link key={index} to={service.link}>
                <GlassCard className="p-6 text-center h-full" hover>
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="text-gray-800 dark:text-white font-medium">{service.name}</h3>
                </GlassCard>
              </Link>
            ))}
          </div>
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
            <h2 className="text-gray-800 dark:text-white mb-4">
              Need Help with Your Health?
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