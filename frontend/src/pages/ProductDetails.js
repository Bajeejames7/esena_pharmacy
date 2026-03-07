import React from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

/**
 * Product details page placeholder
 */
const ProductDetails = () => {
  const { id } = useParams();
  
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <GlassCard className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Product Image</span>
            </div>
            
            <div>
              <h1 className="text-gray-800 mb-4">Product Name {id}</h1>
              <p className="text-gray-600 mb-6">
                Detailed product description, usage instructions, and important information 
                will be displayed here. This includes dosage, side effects, and precautions.
              </p>
              
              <div className="mb-6">
                <span className="text-2xl font-bold text-gray-800">$XX.XX</span>
                <span className="text-gray-500 ml-2">In Stock</span>
              </div>
              
              <div className="flex gap-4">
                <button className="glass-button-primary flex-1">Add to Cart</button>
                <button className="glass-button-secondary">Save for Later</button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ProductDetails;