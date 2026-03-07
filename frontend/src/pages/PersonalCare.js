import React from 'react';
import GlassCard from '../components/GlassCard';

/**
 * Personal Care page placeholder
 */
const PersonalCare = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-gray-800 mb-4">Personal Care Products</h1>
          <p className="text-gray-600">
            Essential personal care items for your daily health and wellness routine.
          </p>
        </GlassCard>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder personal care cards */}
          {['Skincare', 'Oral Care', 'Hair Care', 'Body Care', 'First Aid', 'Hygiene'].map((item) => (
            <GlassCard key={item} className="p-6" hover>
              <div className="aspect-square bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">{item}</span>
              </div>
              <h3 className="text-gray-800 mb-2">{item}</h3>
              <p className="text-gray-600 mb-4">Quality {item.toLowerCase()} products for your daily needs.</p>
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

export default PersonalCare;