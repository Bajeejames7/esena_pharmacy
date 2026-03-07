import React from 'react';
import GlassCard from '../components/GlassCard';

/**
 * Blog page placeholder
 */
const Blog = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-gray-800 mb-4">Health & Wellness Blog</h1>
          <p className="text-gray-600">
            Stay informed with the latest health tips, medication guides, and wellness advice.
          </p>
        </GlassCard>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder blog cards */}
          {[
            'Understanding Your Medications',
            'Seasonal Health Tips',
            'Nutrition and Supplements',
            'Managing Chronic Conditions',
            'Preventive Healthcare',
            'Mental Health Awareness'
          ].map((title, index) => (
            <GlassCard key={index} className="p-6" hover>
              <div className="aspect-video bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-500">Blog Image</span>
              </div>
              <h3 className="text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-600 mb-4">
                Learn more about {title.toLowerCase()} and how it affects your health and wellbeing.
              </p>
              <button className="glass-button-secondary">Read More</button>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;