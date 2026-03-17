import React, { useState, useEffect } from 'react';
import { CookieCache } from '../utils/cacheManager';
import GlassCard from './GlassCard';

/**
 * Cookie Settings Button Component
 * Persistent button that appears after user has given consent
 * Positioned on the left side opposite to reCAPTCHA
 */
const CookieSettingsButton = ({ onOpenPreferences }) => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = CookieCache.get('cookie_consent');
    if (consent) {
      setShowButton(true);
    }
  }, []);

  if (!showButton) return null;

  return (
    <div className="fixed left-4 bottom-4 z-40">
      <button
        onClick={onOpenPreferences}
        className="group relative"
        aria-label="Cookie Settings"
        title="Cookie Settings"
      >
        <GlassCard className="p-3 hover:scale-105 transition-all duration-300" blur="md">
          <div className="flex items-center justify-center">
            <svg 
              className="w-6 h-6 group-hover:scale-110 transition-all duration-200" 
              viewBox="0 0 24 24" 
              fill="none"
            >
              {/* Cookie base - brown color */}
              <circle cx="12" cy="12" r="10" fill="#D2691E" stroke="#8B4513" strokeWidth="1.5"/>
              
              {/* Cookie crumbs/chocolate chips - dark brown */}
              <circle cx="8" cy="8" r="1" fill="#654321"/>
              <circle cx="16" cy="9" r="0.8" fill="#654321"/>
              <circle cx="9" cy="14" r="0.9" fill="#654321"/>
              <circle cx="15" cy="15" r="0.7" fill="#654321"/>
              <circle cx="12" cy="10" r="0.6" fill="#654321"/>
              <circle cx="10" cy="17" r="0.8" fill="#654321"/>
              <circle cx="17" cy="13" r="0.5" fill="#654321"/>
              <circle cx="7" cy="12" r="0.7" fill="#654321"/>
              <circle cx="14" cy="7" r="0.6" fill="#654321"/>
              <circle cx="6" cy="15" r="0.5" fill="#654321"/>
              
              {/* Enhanced bite mark with more realistic shape */}
              <path d="M18.5 5.5 C20.5 7, 21 9, 20 11.5 C19 13, 17.5 13.5, 16 12.5 C17 10, 17.5 7.5, 18.5 5.5 Z" 
                    fill="white" 
                    stroke="none"/>
              
              {/* Inner bite detail */}
              <path d="M18.8 6.2 C19.5 7.2, 19.8 8.5, 19.2 10 C18.5 11, 17.8 11.2, 17.2 10.8 C17.8 9.2, 18.2 7.5, 18.8 6.2 Z" 
                    fill="#F5F5DC" 
                    stroke="none"/>
              
              {/* Cookie texture lines */}
              <path d="M6 10 Q12 8, 18 10" stroke="#8B4513" strokeWidth="0.5" fill="none" opacity="0.3"/>
              <path d="M5 14 Q12 12, 19 14" stroke="#8B4513" strokeWidth="0.5" fill="none" opacity="0.3"/>
              <path d="M7 18 Q12 16, 17 18" stroke="#8B4513" strokeWidth="0.5" fill="none" opacity="0.3"/>
            </svg>
          </div>
        </GlassCard>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-800 dark:bg-gray-700 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Cookie Settings
          </div>
        </div>
      </button>
    </div>
  );
};

/**
 * Cookie Preferences Modal Component (same as before but extracted for reuse)
 */
export const CookiePreferencesModal = ({ onSave, onClose }) => {
  const [preferences, setPreferences] = useState({
    performance: true,
    functional: true,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Load current preferences
    const consent = CookieCache.get('cookie_consent');
    if (consent) {
      setPreferences({
        performance: consent.performance || false,
        functional: consent.functional || false,
        analytics: consent.analytics || false,
        marketing: consent.marketing || false
      });
    }
  }, []);

  const handleToggle = (category) => {
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const handleSave = () => {
    onSave(preferences);
  };

  const cookieCategories = [
    {
      id: 'necessary',
      name: 'Necessary Cookies',
      description: 'Essential for the website to function properly. These cannot be disabled.',
      required: true,
    },
    {
      id: 'performance',
      name: 'Performance Cookies',
      description: 'Help us improve site performance by storing your preferences and enabling faster loading.',
      required: false,
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization features.',
      required: false,
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website.',
      required: false,
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements.',
      required: false,
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Cookie Preferences
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Choose which cookies you want to allow. You can change these settings at any time.
          </p>

          <div className="space-y-6">
            {cookieCategories.map((category) => (
              <div key={category.id} className="border-b border-gray-200/20 dark:border-gray-600/20 pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {category.description}
                    </p>
                  </div>
                  
                  <div className="ml-4">
                    {category.required ? (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Required</span>
                        <div className="w-11 h-6 bg-glass-blue rounded-full flex items-center justify-end px-1">
                          <div className="w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[category.id]}
                          onChange={() => handleToggle(category.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-glass-blue/25 dark:peer-focus:ring-glass-blue/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-glass-blue"></div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 text-white bg-glass-blue hover:bg-glass-blue-dark rounded-lg transition-colors duration-200"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CookieSettingsButton;