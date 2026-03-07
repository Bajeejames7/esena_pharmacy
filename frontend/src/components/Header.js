import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBreakpoint } from '../utils/responsive';
import { useCart } from '../contexts/CartContext';
import GlassCard from './GlassCard';

/**
 * Responsive navigation header with glassmorphism styling
 * Implements Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8
 */
const Header = ({ transparent = false, fixed = true }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { breakpoint } = useBreakpoint();
  const { itemCount } = useCart();
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Supplements', href: '/supplements' },
    { name: 'Personal Care', href: '/personal-care' },
    { name: 'Appointments', href: '/appointments' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={`w-full z-50 ${fixed ? 'fixed top-0' : 'relative'}`}>
      <GlassCard 
        className={`mx-4 mt-4 ${transparent ? 'bg-transparent' : ''}`}
        blur="lg"
        opacity={transparent ? 0.05 : 0.1}
      >
        <nav className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gray-800">
                Esena Pharmacy
              </span>
            </Link>

            {/* Desktop Navigation */}
            {breakpoint === 'desktop' && (
              <div className="hidden lg:flex items-center space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Tablet Navigation */}
            {breakpoint === 'tablet' && (
              <div className="hidden md:flex lg:hidden items-center space-x-6">
                <div className="relative group">
                  <button className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center">
                    Menu
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <GlassCard className="py-2">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`block px-4 py-2 text-sm transition-colors duration-200 ${
                            isActive(item.href)
                              ? 'text-blue-600 bg-blue-50/50'
                              : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/50'
                          }`}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </GlassCard>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            {breakpoint === 'mobile' && (
              <button
                onClick={toggleMenu}
                className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-glass-blue/50"
                aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            )}

            {/* Cart Icon */}
            <div className="flex items-center space-x-4">
              <Link
                to="/shop"
                className="relative p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
                aria-label={`Shopping cart with ${itemCount} items`}
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"
                  />
                </svg>
                {/* Cart badge with actual count */}
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {breakpoint === 'mobile' && isMenuOpen && (
            <div 
              id="mobile-menu"
              className="mt-4 pt-4 border-t border-white/20"
              role="menu"
              aria-label="Mobile navigation menu"
            >
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50/50'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </GlassCard>
    </header>
  );
};

export default Header;