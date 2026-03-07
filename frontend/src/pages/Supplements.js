import React from 'react';
import GlassCard from '../components/GlassCard';

/**
 * Supplements page placeholder
 */
const Supplements = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-gray-800 mb-4">Supplements & Vitamins</h1>
          <p className="text-gray-600">
            Discover our range of high-quality supplements and vitamins for your health needs.
          </p>
        </GlassCard>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder supplement cards */}
          {['Vitamin D3', 'Omega-3', 'Multivitamin', 'Calcium', 'Iron', 'Probiotics'].map((item) => (
            <GlassCard key={item} className="p-6" hover>
              <div className="aspect-square bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">{item}</span>
              </div>
              <h3 className="text-gray-800 mb-2">{item}</h3>
              <p className="text-gray-600 mb-4">High-quality {item.toLowerCase()} supplement for optimal health.</p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">$XX.XX</span>
                <button className="glass-button-primary">Add to Cart</button>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Supplements;