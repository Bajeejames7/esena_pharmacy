import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Enhanced Theme Toggle Button Component
 * Provides a prominent button to switch between light, dark, and system themes
 * Responsive design for desktop, tablet, and mobile views
 */
const ThemeToggle = ({ className = '', showLabel = false }) => {
  const { 
    theme, 
    systemPreference, 
    isUsingSystemPreference, 
    toggleTheme, 
    switchToSystemTheme, 
    switchToManualTheme, 
    isDark 
  } = useTheme();
  
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleQuickToggle = (e) => {
    e.stopPropagation();
    toggleTheme();
  };

  const handleDropdownToggle = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleThemeSelect = (selectedTheme) => {
    if (selectedTheme === 'system') {
      switchToSystemTheme();
    } else {
      switchToManualTheme(selectedTheme);
    }
    setShowDropdown(false);
  };

  const getCurrentIcon = () => {
    if (isUsingSystemPreference) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    }
    
    return isDark ? (
      // Moon Icon (Dark Mode)
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ) : (
      // Sun Icon (Light Mode)
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    );
  };

  const getThemeLabel = () => {
    if (isUsingSystemPreference) {
      return `System (${systemPreference})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Desktop View - Dropdown with options */}
      <div className="hidden lg:block">
        <button
          onClick={handleDropdownToggle}
          className={`
            flex items-center space-x-2 px-4 py-3 rounded-xl
            glass-button
            transition-all duration-300
            hover:scale-105 transform
            focus:outline-none focus:ring-2 focus:ring-glass-blue/50
            ${showDropdown ? 'ring-2 ring-glass-blue/50' : ''}
          `}
          aria-label={`Current theme: ${getThemeLabel()}. Click to change theme`}
          aria-expanded={showDropdown}
          aria-haspopup="true"
        >
          <div className="transition-transform duration-300 text-gray-700 dark:text-gray-200">
            {getCurrentIcon()}
          </div>
          {showLabel && (
            <span className="text-sm font-medium hidden xl:block text-gray-700 dark:text-gray-200">
              {getThemeLabel()}
            </span>
          )}
          <svg className="w-4 h-4 ml-1 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute top-full right-0 mt-2 w-48 glass-card border border-white/20 dark:border-slate-600/30 rounded-lg shadow-lg py-2 z-50">
            <button
              onClick={() => handleThemeSelect('light')}
              className={`
                w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-white/10 dark:hover:bg-slate-700/50 transition-colors
                ${theme === 'light' && !isUsingSystemPreference ? 'bg-glass-blue/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span>Light</span>
            </button>
            
            <button
              onClick={() => handleThemeSelect('dark')}
              className={`
                w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-white/10 dark:hover:bg-slate-700/50 transition-colors
                ${theme === 'dark' && !isUsingSystemPreference ? 'bg-glass-blue/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span>Dark</span>
            </button>
            
            <button
              onClick={() => handleThemeSelect('system')}
              className={`
                w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-white/10 dark:hover:bg-slate-700/50 transition-colors
                ${isUsingSystemPreference ? 'bg-glass-blue/20 text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-200'}
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>System ({systemPreference})</span>
            </button>
          </div>
        )}
      </div>

      {/* Tablet and Mobile View - Simple toggle */}
      <div className="lg:hidden">
        <button
          onClick={handleQuickToggle}
          className={`
            relative inline-flex items-center justify-center
            w-12 h-12 rounded-xl
            glass-button
            transition-all duration-300
            hover:scale-105 transform
            focus:outline-none focus:ring-2 focus:ring-glass-blue/50
          `}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme. Currently using ${getThemeLabel()}`}
          title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        >
          <div className="transition-all duration-300 transform text-gray-700 dark:text-gray-200">
            {getCurrentIcon()}
          </div>
          
          {/* System indicator for mobile */}
          {isUsingSystemPreference && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          )}
        </button>
      </div>
    </div>
  );
};

export default ThemeToggle;