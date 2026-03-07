import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';

/**
 * Header component with responsive navigation, cart display, and theme toggle
 * Implements Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8
 * Enhanced with improved tablet menu accessibility and dark theme support
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { cart } = useCart();
  const { isDark } = useTheme();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Calculate total items in cart
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  const isActivePage = (path) => {
    return location.pathname === path;
  };

  const navLinkClass = (path) => `
    block px-4 py-2 rounded-lg transition-all duration-200
    ${isActivePage(path) 
      ? 'bg-glass-blue/20 text-blue-700 dark:text-blue-300 font-medium' 
      : 'text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/50'
    }
  `;

  const dropdownItems = {
    home: [
      { name: 'About Us', path: '/about' },
      { name: 'Blog', path: '/blog' },
      { name: 'Contact', path: '/contact' }
    ],
    products: [
      { name: 'All Products', path: '/products' },
      { name: 'Supplements', path: '/supplements' },
      { name: 'Personal Care', path: '/personal-care' }
    ],
    services: [
      { name: 'Book Appointment', path: '/book-appointment' },
      { name: 'Track Order', path: '/track-order' }
    ]
  };

  return (
    <header 
      className="sticky top-0 z-50 glass-card border-b border-white/20 dark:border-slate-600/30"
      id="navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-glass-blue/50 rounded-lg p-1"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              Esena Pharmacy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" ref={dropdownRef}>
            {/* Home Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('home')}
                onKeyDown={(e) => handleKeyDown(e, () => toggleDropdown('home'))}
                className={`
                  flex items-center px-4 py-2 rounded-lg transition-all duration-200
                  ${isActivePage('/') || isActivePage('/about') || isActivePage('/blog') || isActivePage('/contact')
                    ? 'bg-glass-blue/20 text-blue-700 dark:text-blue-300 font-medium' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/50'
                  }
                `}
                aria-expanded={activeDropdown === 'home'}
                aria-haspopup="true"
              >
                Home
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeDropdown === 'home' && (
                <div className="absolute top-full left-0 mt-1 w-48 glass-card border border-white/20 dark:border-slate-600/30 rounded-lg shadow-lg py-2">
                  <Link to="/" className={navLinkClass('/')}>
                    Home
                  </Link>
                  {dropdownItems.home.map((item) => (
                    <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('products')}
                onKeyDown={(e) => handleKeyDown(e, () => toggleDropdown('products'))}
                className={`
                  flex items-center px-4 py-2 rounded-lg transition-all duration-200
                  ${isActivePage('/products') || isActivePage('/supplements') || isActivePage('/personal-care')
                    ? 'bg-glass-blue/20 text-blue-700 dark:text-blue-300 font-medium' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/50'
                  }
                `}
                aria-expanded={activeDropdown === 'products'}
                aria-haspopup="true"
              >
                Products
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeDropdown === 'products' && (
                <div className="absolute top-full left-0 mt-1 w-48 glass-card border border-white/20 dark:border-slate-600/30 rounded-lg shadow-lg py-2">
                  {dropdownItems.products.map((item) => (
                    <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Services Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('services')}
                onKeyDown={(e) => handleKeyDown(e, () => toggleDropdown('services'))}
                className={`
                  flex items-center px-4 py-2 rounded-lg transition-all duration-200
                  ${isActivePage('/book-appointment') || isActivePage('/track-order')
                    ? 'bg-glass-blue/20 text-blue-700 dark:text-blue-300 font-medium' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/50'
                  }
                `}
                aria-expanded={activeDropdown === 'services'}
                aria-haspopup="true"
              >
                Services
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {activeDropdown === 'services' && (
                <div className="absolute top-full left-0 mt-1 w-48 glass-card border border-white/20 dark:border-slate-600/30 rounded-lg shadow-lg py-2">
                  {dropdownItems.services.map((item) => (
                    <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link to="/shop" className={navLinkClass('/shop')}>
              Shop
            </Link>
          </nav>

          {/* Right side items */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Cart Icon */}
            <Link
              to="/shop"
              className="relative p-2 glass-button rounded-lg focus:outline-none focus:ring-2 focus:ring-glass-blue/50"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={toggleMobileMenu}
              onKeyDown={(e) => handleKeyDown(e, toggleMobileMenu)}
              className="lg:hidden p-2 glass-button rounded-lg focus:outline-none focus:ring-2 focus:ring-glass-blue/50"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-white/20 dark:border-slate-600/30">
            <nav className="mt-4 space-y-2">
              {/* Home Section */}
              <div>
                <button
                  onClick={() => toggleDropdown('mobile-home')}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <span className="font-medium">Home</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-home' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'mobile-home' && (
                  <div className="ml-4 mt-2 space-y-1">
                    <Link to="/" className={navLinkClass('/')}>
                      Home
                    </Link>
                    {dropdownItems.home.map((item) => (
                      <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Products Section */}
              <div>
                <button
                  onClick={() => toggleDropdown('mobile-products')}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <span className="font-medium">Products</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-products' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'mobile-products' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {dropdownItems.products.map((item) => (
                      <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Services Section */}
              <div>
                <button
                  onClick={() => toggleDropdown('mobile-services')}
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-white/10 dark:hover:bg-slate-700/50 rounded-lg transition-all duration-200"
                >
                  <span className="font-medium">Services</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === 'mobile-services' ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'mobile-services' && (
                  <div className="ml-4 mt-2 space-y-1">
                    {dropdownItems.services.map((item) => (
                      <Link key={item.path} to={item.path} className={navLinkClass(item.path)}>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/shop" className={navLinkClass('/shop')}>
                Shop
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;