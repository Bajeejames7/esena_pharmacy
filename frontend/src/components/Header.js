import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import ThemeToggle from './ThemeToggle';

/**
 * Header component with responsive navigation, cart display, and theme toggle
 * Implements Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8
 * Enhanced with improved tablet menu accessibility and dark theme support
 */
const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { itemCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Use the pre-calculated item count
  const totalItems = itemCount || 0;

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
    setIsMobileMenuOpen(prev => !prev);
    setActiveDropdown(null);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleMobileNavigation = (path) => {
    console.log('Navigating to:', path);
    console.log('Current location:', location.pathname);
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
    // Use setTimeout to ensure state updates before navigation
    setTimeout(() => {
      navigate(path);
    }, 100);
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
      { name: 'Upload Prescription', path: '/upload-prescription' },
      { name: 'Book Appointment', path: '/book-appointment' },
      { name: 'Delivery Info', path: '/delivery' },
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
            <div className="flex flex-col items-center">
              <img 
                src="/full_logo.jpeg" 
                alt="Esena Pharmacy logo Ruaraka Nairobi pharmacy" 
                className="h-10 w-auto object-contain"
              />
              <span className="text-xs text-gray-600 dark:text-gray-400 font-medium mt-1">
                Trusted Care, Every day
              </span>
            </div>
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
          <div className="flex items-center space-x-2">
            {/* Theme Toggle - More prominent */}
            <div className="order-2 lg:order-1">
              <ThemeToggle showLabel={true} />
            </div>

            {/* Cart Icon */}
            <div className="order-1 lg:order-2">
              <Link
                to="/shop"
                className="relative inline-block p-2 rounded-lg hover:bg-white/5 dark:hover:bg-slate-700/20 hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-glass-blue/50"
                aria-label={`Shopping cart with ${totalItems} items`}
              >
                {/* Modern shopping cart icon */}
                <img 
                  src="/cart.png" 
                  alt="Shopping Cart" 
                  className="w-6 h-6"
                />
                
                {/* Cart count badge - only show when items exist */}
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg border-2 border-white dark:border-gray-800 translate-x-1 -translate-y-1">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden order-3 relative z-50">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMobileMenu();
                }}
                onKeyDown={(e) => handleKeyDown(e, toggleMobileMenu)}
                className="relative p-3 bg-white/10 dark:bg-slate-700/50 hover:bg-white/20 dark:hover:bg-slate-600/50 rounded-xl hover:scale-105 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-glass-blue/50 active:scale-95 border border-white/20 dark:border-slate-600/30"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
                type="button"
              >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden py-4 space-y-2"
          >
            {/* Home Section */}
            <div className="px-2">
              <button
                onClick={() => toggleDropdown('mobile-home')}
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-600/40 rounded-lg"
              >
                <span className="font-medium">Home</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-home' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {activeDropdown === 'mobile-home' && (
              <div className="px-2 ml-4 space-y-1">
                <Link 
                  to="/"
                  className="block px-4 py-3 text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-600/40 rounded-lg font-medium"
                  onClick={(e) => {
                    console.log('Home clicked');
                    setIsMobileMenuOpen(false);
                    setActiveDropdown(null);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    console.log('Home touched');
                    navigate('/');
                    setIsMobileMenuOpen(false);
                    setActiveDropdown(null);
                  }}
                >
                  Home
                </Link>
                {dropdownItems.home.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-600/40 rounded-lg font-medium"
                    onClick={(e) => {
                      console.log('Clicked:', item.name);
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      console.log('Touched:', item.name);
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Products Section */}
            <div className="px-2">
              <button
                onClick={() => toggleDropdown('mobile-products')}
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-600/40 rounded-lg"
              >
                <span className="font-medium">Products</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-products' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {activeDropdown === 'mobile-products' && (
              <div className="px-2 ml-4 space-y-1">
                {dropdownItems.products.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-600/40 rounded-lg font-medium"
                    onClick={(e) => {
                      console.log('Clicked:', item.name);
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      console.log('Touched:', item.name);
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Services Section */}
            <div className="px-2">
              <button
                onClick={() => toggleDropdown('mobile-services')}
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 text-left text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-600/40 rounded-lg"
              >
                <span className="font-medium">Services</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${activeDropdown === 'mobile-services' ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {activeDropdown === 'mobile-services' && (
              <div className="px-2 ml-4 space-y-1">
                {dropdownItems.services.map((item) => (
                  <Link 
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-3 text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-600/40 rounded-lg font-medium"
                    onClick={(e) => {
                      console.log('Clicked:', item.name);
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      console.log('Touched:', item.name);
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Shop Link */}
            <div className="px-2">
              <Link 
                to="/shop"
                className="block px-4 py-3 text-gray-700 dark:text-gray-200 bg-white/10 dark:bg-slate-700/30 hover:bg-white/20 dark:hover:bg-slate-600/40 rounded-lg font-medium"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setActiveDropdown(null);
                }}
              >
                Shop
              </Link>
            </div>

            {/* Theme Toggle in Mobile Menu */}
            <div className="px-2 pt-4 mt-4 border-t border-white/20 dark:border-slate-600/30">
              <div className="px-4 py-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3 block">
                  Theme Settings
                </span>
                <div className="flex justify-center">
                  <ThemeToggle showLabel={false} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;