import React, { useState, useEffect } from 'react';
import { CookieCache } from '../utils/cacheManager';
import GlassCard from './GlassCard';
import { CookiePreferencesModal } from './CookieSettingsButton';

/**
 * Cookie Consent Banner Component
 * Handles GDPR compliance and cookie preferences
 */
const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = CookieCache.get('cookie_consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      necessary: true,
      performance: true,
      functional: true,
      analytics: false, // We don't use analytics cookies yet
      marketing: false, // We don't use marketing cookies yet
      timestamp: Date.now()
    };
    
    CookieCache.set('cookie_consent', consent, 365); // 1 year
    setShowBanner(false);
    // Reload page to show cookie settings button
    window.location.reload();
  };

  const handleAcceptNecessary = () => {
    const consent = {
      necessary: true,
      performance: false,
      functional: false,
      analytics: false,
      marketing: false,
      timestamp: Date.now()
    };
    
    CookieCache.set('cookie_consent', consent, 365);
    setShowBanner(false);
    // Reload page to show cookie settings button
    window.location.reload();
  };

  const handleSavePreferences = (preferences) => {
    const consent = {
      necessary: true, // Always required
      ...preferences,
      timestamp: Date.now()
    };
    
    CookieCache.set('cookie_consent', consent, 365);
    setShowBanner(false);
    setShowPreferences(false);
    // Reload page to show cookie settings button
    window.location.reload();
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
        <GlassCard className="max-w-4xl mx-auto" blur="lg">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  🍪 We use cookies to enhance your experience
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  We use cookies to improve your browsing experience, store your preferences, and provide better performance. 
                  These help us remember your settings and make the site faster for you.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 lg:ml-6">
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors duration-200"
                >
                  Customize
                </button>
                <button
                  onClick={handleAcceptNecessary}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/20 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors duration-200"
                >
                  Necessary Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 text-sm font-medium text-white bg-glass-blue hover:bg-glass-blue-dark rounded-lg transition-colors duration-200"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Cookie Preferences Modal */}
      {showPreferences && (
        <CookiePreferencesModal
          onSave={handleSavePreferences}
          onClose={() => setShowPreferences(false)}
        />
      )}
    </>
  );
};

export default CookieConsent;