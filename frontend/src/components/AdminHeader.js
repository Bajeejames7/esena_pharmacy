import React from 'react';
import { useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

/**
 * Admin header component for mobile devices
 * Shows page title and mobile menu toggle
 */
const AdminHeader = ({ onMenuToggle, showMenuButton = true }) => {
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    switch (path) {
      case '/admin/dashboard':
        return 'Dashboard';
      case '/admin/products':
        return 'Manage Products';
      case '/admin/orders':
        return 'Manage Orders';
      case '/admin/appointments':
        return 'Manage Appointments';
      default:
        return 'Admin Panel';
    }
  };

  return (
    <header className="lg:hidden sticky top-0 z-40 glass-card border-b border-white/20 dark:border-slate-600/30">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {showMenuButton && (
            <button
              onClick={onMenuToggle}
              className="p-2 rounded-lg bg-white/10 dark:bg-slate-700/50 hover:bg-white/20 dark:hover:bg-slate-600/50 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          
          <div className="flex items-center space-x-3">
            <img 
              src="/full_logo.jpeg" 
              alt="Esena Pharmacy" 
              className="h-10 w-auto object-contain"
            />
            <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{getPageTitle()}</h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ThemeToggle showLabel={false} />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;