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
            <img 
              src="/cookie_image.png" 
              alt="Cookie Settings" 
              className="w-6 h-6 group-hover:scale-110 transition-all duration-200"
            />
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
      examples: 'Session management, security, basic functionality'
    },
    {
      id: 'performance',
      name: 'Performance Cookies',
      description: 'Help us improve site performance by storing your preferences and enabling faster loading.',
      required: false,
      examples: 'Image caching, user preferences, performance settings'
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization features.',
      required: false,
      examples: 'Theme preferences, language settings, shopping cart'
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website (currently not used).',
      required: false,
      examples: 'Page views, user behavior, site statistics'
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver relevant advertisements (currently not used).',
      required: false,
      examples: 'Ad targeting, social media integration, marketing campaigns'
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      <strong>Examples:</strong> {category.examples}
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

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              About Our Cookies
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• We don't sell your data to third parties</li>
              <li>• Performance cookies help make the site faster for you</li>
              <li>• You can change these settings anytime using this button</li>
              <li>• Necessary cookies are required for basic functionality</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default CookieSettingsButton;