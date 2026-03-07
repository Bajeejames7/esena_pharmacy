import React from 'react';
import GlassCard from '../components/GlassCard';

/**
 * About page with pharmacy information
 */
const About = () => {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <GlassCard className="p-8 md:p-12">
          <h1 className="text-gray-800 dark:text-white mb-8 text-center">About Esena Pharmacy</h1>
          
          <div className="prose prose-lg max-w-none text-gray-600 dark:text-gray-300">
            <p className="mb-6">
              Esena Pharmacy has been serving our community for over two decades, providing 
              quality healthcare solutions and personalized pharmaceutical services. We are 
              committed to improving the health and well-being of our patients through 
              professional expertise and compassionate care.
            </p>
            
            <h2 className="text-gray-800 dark:text-white mb-4">Our Mission</h2>
            <p className="mb-6">
              To provide accessible, affordable, and high-quality pharmaceutical care while 
              building lasting relationships with our patients and community. We strive to 
              be your trusted healthcare partner in every step of your wellness journey.
            </p>
            
            <h2 className="text-gray-800 dark:text-white mb-4">Our Services</h2>
            <ul className="mb-6 space-y-2">
              <li>• Prescription medications and consultations</li>
              <li>• Over-the-counter medications and supplements</li>
              <li>• Personal care and wellness products</li>
              <li>• Health screenings and consultations</li>
              <li>• Medication therapy management</li>
              <li>• Home delivery services</li>
            </ul>
            
            <h2 className="text-gray-800 dark:text-white mb-4">Why Choose Us</h2>
            <p className="mb-4">
              Our experienced team of licensed pharmacists and healthcare professionals 
              are dedicated to providing personalized care tailored to your unique needs. 
              We maintain the highest standards of quality and safety in all our services.
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default About;