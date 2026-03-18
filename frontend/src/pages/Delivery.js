import React from 'react';
import GlassCard from '../components/GlassCard';

const PICKUP_ADDRESS = 'Esena Pharmacy, Outering Road, Behind Eastmart Supermarket, Ruaraka, Nairobi';
const PHONE = '+254 768 103 599';
const EMAIL = 'info@esenapharmacy.co.ke';

const deliveryZones = [
  {
    zone: 'Nairobi',
    time: 'Same Day',
    cost: 'KSh 150',
    icon: '🏙️',
    areas: ['Nairobi CBD', 'Westlands', 'Kilimani', 'Kasarani', 'Ruaraka', 'Thika Road', 'Karen', 'Lavington', 'and more']
  },
  {
    zone: 'Outside Nairobi',
    time: '1–3 Days',
    cost: 'KSh 350',
    icon: '🗺️',
    areas: ['Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika', 'Nyeri', 'All other towns & counties']
  }
];

const Delivery = () => {
  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-3">
            🚚 Medicine Delivery Across Kenya
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Fast, reliable delivery of your medicines to your doorstep. Same-day service available in Nairobi.
          </p>
        </GlassCard>

        {/* Free Delivery Banner */}
        <GlassCard className="p-5 mb-8 text-center border-green-400/30 dark:border-green-500/30">
          <p className="text-green-700 dark:text-green-400 font-semibold text-lg">
            🎉 FREE DELIVERY on orders above KSh 3,000
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Perfect for monthly medication refills and bulk orders.
          </p>
        </GlassCard>

        {/* Delivery Zones */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
          Delivery Options & Pricing
        </h2>
        <p className="text-sm text-center text-amber-600 dark:text-amber-400 mb-6">
          ⚠️ Prices are subject to change depending on your exact location.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {deliveryZones.map((zone, i) => (
            <GlassCard key={i} className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="text-2xl mr-2">{zone.icon}</span>
                  <span className="text-lg font-semibold text-gray-800 dark:text-white">{zone.zone}</span>
                </div>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{zone.cost}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">⏱ {zone.time}</p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                {zone.areas.map((area, j) => (
                  <li key={j} className="flex items-center gap-1">
                    <span className="text-green-500">✓</span> {area}
                  </li>
                ))}
              </ul>
            </GlassCard>
          ))}
        </div>

        {/* Pickup Option */}
        <GlassCard className="p-6 mb-8 border-green-400/30 dark:border-green-500/30">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">🏪 Pick Up In-Store</h3>
            <span className="text-xl font-bold text-green-600 dark:text-green-400">FREE</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            Order online and collect at our pharmacy — no delivery fee.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">📍 {PICKUP_ADDRESS}</p>
        </GlassCard>

        {/* Contact */}
        <GlassCard className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Need Help?</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            Contact us for delivery queries or to confirm availability in your area.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
            <a href={`tel:${PHONE}`} className="text-blue-600 dark:text-blue-400 hover:underline">📞 {PHONE}</a>
            <a href={`https://wa.me/254768103599`} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline">💬 WhatsApp</a>
            <a href={`mailto:${EMAIL}`} className="text-blue-600 dark:text-blue-400 hover:underline">✉️ {EMAIL}</a>
          </div>
        </GlassCard>

      </div>
    </div>
  );
};

export default Delivery;
