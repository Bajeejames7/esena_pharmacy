import React from 'react';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from '../components/GlassCard';

/**
 * Delivery Information Page
 * Shows delivery options, costs, and coverage areas
 */
const Delivery = () => {
  const { breakpoint } = useBreakpoint();

  const deliveryZones = [
    {
      zone: 'Nairobi CBD',
      time: 'Same Day (2-4 hours)',
      cost: 'KSh 200',
      areas: ['CBD', 'Westlands', 'Kilimani', 'Lavington', 'Karen', 'Runda']
    },
    {
      zone: 'Greater Nairobi',
      time: 'Same Day (4-8 hours)',
      cost: 'KSh 300',
      areas: ['Kasarani', 'Ruaraka', 'Thika Road', 'Kiambu', 'Machakos', 'Kajiado']
    },
    {
      zone: 'Major Towns',
      time: '1-2 Days',
      cost: 'KSh 400',
      areas: ['Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri']
    },
    {
      zone: 'Other Areas',
      time: '2-3 Days',
      cost: 'KSh 500',
      areas: ['All other towns and rural areas across Kenya']
    }
  ];

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            🚚 Medicine Delivery Across Kenya
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fast, reliable delivery of your medicines to your doorstep. We deliver nationwide with same-day service in Nairobi.
          </p>
        </GlassCard>

        {/* Free Delivery Banner */}
        <GlassCard className="p-6 mb-8 bg-gradient-to-r from-glass-green/10 to-glass-blue/10 border-glass-green/30 dark:border-glass-green/50">
          <div className="text-center">
            <h2 className="text-xl font-bold text-glass-green-dark dark:text-glass-green-light mb-2">
              🎉 FREE DELIVERY on orders above KSh 3,000
            </h2>
            <p className="text-glass-green dark:text-glass-green-light">
              Save on delivery costs with bulk orders. Perfect for monthly medication refills!
            </p>
          </div>
        </GlassCard>

        {/* Delivery Zones */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            Delivery Zones & Pricing
          </h2>
          <div className={`grid gap-6 ${
            breakpoint === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
          }`}>
            {deliveryZones.map((zone, index) => (
              <GlassCard key={index} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {zone.zone}
                  </h3>
                  <span className="text-xl font-bold text-glass-blue">
                    {zone.cost}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <span className="text-glass-green dark:text-glass-green-light mr-2">⏱️</span>
                    <span className="text-gray-700 dark:text-gray-300">{zone.time}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-white mb-2">Coverage Areas:</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {zone.areas.join(', ')}
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <GlassCard className="p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
            How Medicine Delivery Works
          </h2>
          <div className={`grid gap-6 ${
            breakpoint === 'mobile' ? 'grid-cols-1' : 'grid-cols-4'
          }`}>
            {[
              {
                step: '1',
                title: 'Place Order',
                description: 'Order online or upload prescription via WhatsApp',
                icon: '🛒'
              },
              {
                step: '2',
                title: 'Pharmacist Review',
                description: 'Licensed pharmacist verifies and prepares your order',
                icon: '👨🏾‍⚕️'
              },
              {
                step: '3',
                title: 'Payment',
                description: 'Pay securely via Mpesa, card, or cash on delivery',
                icon: '💳'
              },
              {
                step: '4',
                title: 'Delivery',
                description: 'Receive your medicines at your preferred location',
                icon: '🚚'
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-glass-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">{step.icon}</span>
                </div>
                <div className="w-8 h-8 bg-glass-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold">{step.step}</span>
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{step.description}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Delivery Policies */}
        <div className={`grid gap-8 ${
          breakpoint === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'
        }`}>
          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              📋 Delivery Policies
            </h3>
            <div className="space-y-3 text-gray-600 dark:text-gray-300">
              <div className="flex items-start">
                <span className="text-glass-green mr-2">✓</span>
                <span>All medicines are delivered in secure, temperature-controlled packaging</span>
              </div>
              <div className="flex items-start">
                <span className="text-glass-green mr-2">✓</span>
                <span>Prescription medicines require ID verification upon delivery</span>
              </div>
              <div className="flex items-start">
                <span className="text-glass-green mr-2">✓</span>
                <span>Delivery tracking available via SMS and WhatsApp</span>
              </div>
              <div className="flex items-start">
                <span className="text-glass-green mr-2">✓</span>
                <span>Contactless delivery available upon request</span>
              </div>
              <div className="flex items-start">
                <span className="text-glass-green mr-2">✓</span>
                <span>Delivery attempts made 3 times before return to pharmacy</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              📞 Need Help?
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Track Your Order</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  Use your order number to track delivery status
                </p>
                <a 
                  href="/track-order" 
                  className="text-glass-blue hover:text-glass-blue/80 font-medium"
                >
                  Track Order →
                </a>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Customer Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span className="mr-2">📞</span>
                    <span>+254 700 123 456</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span className="mr-2">📱</span>
                    <a href="https://wa.me/254700123456" className="text-glass-blue hover:text-glass-blue/80">
                      WhatsApp Support
                    </a>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <span className="mr-2">✉️</span>
                    <span>info@esenapharmacy.co.ke</span>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Delivery;