import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Theme Context for managing dark/light mode across the application
 * Provides theme state and toggle functionality with localStorage persistence
 * Enhanced with better system preference handling and responsive behavior
 */

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('esena-theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        return savedTheme;
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  const [systemPreference, setSystemPreference] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isUsingSystemPreference, setIsUsingSystemPreference] = useState(() => {
    return !localStorage.getItem('esena-theme');
  });

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Save to localStorage only if user manually set it
    if (!isUsingSystemPreference) {
      localStorage.setItem('esena-theme', theme);
    }
  }, [theme, isUsingSystemPreference]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e) => {
        const newSystemPreference = e.matches ? 'dark' : 'light';
        setSystemPreference(newSystemPreference);
        
        // Only auto-switch if user is using system preference
        if (isUsingSystemPreference) {
          setTheme(newSystemPreference);
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [isUsingSystemPreference]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setIsUsingSystemPreference(false);
    localStorage.setItem('esena-theme', newTheme);
  };

  const switchToSystemTheme = () => {
    setIsUsingSystemPreference(true);
    setTheme(systemPreference);
    localStorage.removeItem('esena-theme');
  };

  const switchToManualTheme = (newTheme) => {
    setTheme(newTheme);
    setIsUsingSystemPreference(false);
    localStorage.setItem('esena-theme', newTheme);
  };

  const value = {
    theme,
    systemPreference,
    isUsingSystemPreference,
    toggleTheme,
    switchToSystemTheme,
    switchToManualTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;