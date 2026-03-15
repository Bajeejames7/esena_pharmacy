import React, { useState, useEffect } from 'react';
import { cacheManager, PerformancePreferences } from '../utils/cacheManager';
import GlassCard from './GlassCard';

/**
 * Performance Settings Component
 * Allows users to control caching and performance preferences
 */
const PerformanceSettings = ({ isOpen, onClose }) => {
  const [preferences, setPreferences] = useState(PerformancePreferences.getPreferences());
  const [cacheStats, setCacheStats] = useState(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCacheStats();
    }
  }, [isOpen]);

  const loadCacheStats = async () => {
    try {
      const stats = cacheManager.getCacheStats();
      setCacheStats(stats);
    } catch (e) {
      console.error('Failed to load cache stats:', e);
    }
  };

  const handlePreferenceChange = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    PerformancePreferences.setPreferences(newPrefs);
  };

  const clearAllCaches = async () => {
    setIsClearing(true);
    try {
      cacheManager.clearAllCaches();
      
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      await loadCacheStats();
      alert('Browser storage cleared successfully!');
    } catch (e) {
      console.error('Failed to clear caches:', e);
      alert('Failed to clear some browser storage. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Performance Settings
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

          {/* Cache Statistics */}
          {cacheStats && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                Cache Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Local Storage</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {formatBytes(cacheStats.localStorageSize)}
                  </div>
                </div>
                <div className="bg-white/20 dark:bg-gray-800/20 rounded-lg p-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Memory Cache</div>
                  <div className="text-lg font-semibold text-gray-800 dark:text-white">
                    {cacheStats.memoryCacheSize} items
                  </div>
                </div>
              </div>
              
              {cacheStats.isSlowConnection && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 mb-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">
                      Slow connection detected. Some features may be automatically disabled.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Performance Preferences */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              Performance Preferences
            </h3>
            
            <div className="space-y-4">
              {/* Image Caching */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Image Caching
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Store images in browser for faster loading
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.enableImageCache}
                    onChange={(e) => handlePreferenceChange('enableImageCache', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-glass-blue/25 dark:peer-focus:ring-glass-blue/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-glass-blue"></div>
                </label>
              </div>

              {/* API Caching */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    API Response Caching
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Store API responses in browser to reduce server requests
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.enableApiCache}
                    onChange={(e) => handlePreferenceChange('enableApiCache', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-glass-blue/25 dark:peer-focus:ring-glass-blue/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-glass-blue"></div>
                </label>
              </div>

              {/* Image Preloading */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Image Preloading
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Preload images for smoother browsing (uses more data)
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.enablePreloading}
                    onChange={(e) => handlePreferenceChange('enablePreloading', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-glass-blue/25 dark:peer-focus:ring-glass-blue/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-glass-blue"></div>
                </label>
              </div>

              {/* Cache Expiry */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-800 dark:text-white">
                    Cache Expiry (hours)
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    How long to keep stored data in browser
                  </div>
                </div>
                <select
                  value={preferences.cacheExpiry}
                  onChange={(e) => handlePreferenceChange('cacheExpiry', parseInt(e.target.value))}
                  className="bg-white/20 dark:bg-gray-800/20 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-gray-800 dark:text-white focus:ring-2 focus:ring-glass-blue focus:border-transparent"
                >
                  <option value={1}>1 hour</option>
                  <option value={6}>6 hours</option>
                  <option value={24}>24 hours</option>
                  <option value={72}>3 days</option>
                  <option value={168}>1 week</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={clearAllCaches}
              disabled={isClearing}
              className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              {isClearing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Clearing...
                </>
              ) : (
                'Clear Browser Storage'
              )}
            </button>
            
            <button
              onClick={loadCacheStats}
              className="flex-1 glass-button-secondary"
            >
              Refresh Stats
            </button>
            
            <button
              onClick={onClose}
              className="flex-1 glass-button-primary"
            >
              Done
            </button>
          </div>

          {/* Performance Tips */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              💡 Performance Tips
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Enable image storage for faster page loads</li>
              <li>• Disable preloading on slow connections to save data</li>
              <li>• Clear browser storage if you notice outdated content</li>
              <li>• Longer storage time reduces server requests</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default PerformanceSettings;