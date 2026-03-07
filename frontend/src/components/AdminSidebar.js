import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from './GlassCard';

/**
 * Admin sidebar navigation component
 * Implements Requirements 2.7
 */
const AdminSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { breakpoint } = useBreakpoint();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isMobile = breakpoint === 'mobile';

  const menuItems = [
    {
      path: '/admin/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2H3a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      path: '/admin/products',
      label: 'Products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      path: '/admin/orders',
      label: 'Orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      path: '/admin/appointments',
      label: 'Appointments',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v6a2 2 0 01-2 2H10a2 2 0 01-2-2v-6" />
        </svg>
      )
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const getUserInfo = () => {
    try {
      const userInfo = localStorage.getItem('adminUser');
      return userInfo ? JSON.parse(userInfo) : { username: 'Admin', role: 'admin' };
    } catch {
      return { username: 'Admin', role: 'admin' };
    }
  };

  const userInfo = getUserInfo();

  // Mobile overlay
  if (isMobile && isOpen) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onToggle}
        />
        
        {/* Sidebar */}
        <div className="fixed left-0 top-0 h-full w-64 z-50 transform transition-transform">
          <GlassCard className="h-full rounded-none p-6">
            <SidebarContent 
              menuItems={menuItems}
              location={location}
              userInfo={userInfo}
              showLogoutConfirm={showLogoutConfirm}
              setShowLogoutConfirm={setShowLogoutConfirm}
              handleLogout={handleLogout}
              onToggle={onToggle}
              isMobile={isMobile}
            />
          </GlassCard>
        </div>
      </>
    );
  }

  // Desktop sidebar
  if (!isMobile) {
    return (
      <div className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}>
        <div className="fixed left-0 top-0 h-full transition-all duration-300" style={{ width: isOpen ? '256px' : '64px' }}>
          <GlassCard className="h-full rounded-none p-4">
            <SidebarContent 
              menuItems={menuItems}
              location={location}
              userInfo={userInfo}
              showLogoutConfirm={showLogoutConfirm}
              setShowLogoutConfirm={setShowLogoutConfirm}
              handleLogout={handleLogout}
              onToggle={onToggle}
              isCollapsed={!isOpen}
            />
          </GlassCard>
        </div>
      </div>
    );
  }

  return null;
};

const SidebarContent = ({ 
  menuItems, 
  location, 
  userInfo, 
  showLogoutConfirm, 
  setShowLogoutConfirm, 
  handleLogout, 
  onToggle, 
  isMobile, 
  isCollapsed 
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        {(!isCollapsed || isMobile) && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Esena Admin</h2>
            </div>
          </div>
        )}
        
        {!isMobile && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        {isMobile && (
          <button
            onClick={onToggle}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            aria-label="Close sidebar"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={isMobile ? onToggle : undefined}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-glass-blue/20 to-glass-green/20 text-blue-700'
                      : 'text-gray-600 hover:bg-white/20 hover:text-gray-800'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className={isActive ? 'text-blue-600' : 'text-gray-500'}>
                    {item.icon}
                  </span>
                  {(!isCollapsed || isMobile) && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info and Logout */}
      <div className="border-t border-white/20 pt-4">
        {(!isCollapsed || isMobile) && (
          <div className="mb-4">
            <div className="flex items-center space-x-3 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-glass-blue to-glass-green rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {userInfo.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800 text-sm">{userInfo.username}</p>
                <p className="text-gray-600 text-xs capitalize">{userInfo.role}</p>
              </div>
            </div>
          </div>
        )}

        {showLogoutConfirm ? (
          <div className="space-y-2">
            {(!isCollapsed || isMobile) && (
              <p className="text-sm text-gray-600 px-3">Are you sure?</p>
            )}
            <div className="flex space-x-2">
              <button
                onClick={handleLogout}
                className="flex-1 px-3 py-2 bg-red-500/20 text-red-700 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
              >
                {isCollapsed && !isMobile ? '✓' : 'Yes'}
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-3 py-2 bg-gray-500/20 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-500/30 transition-colors"
              >
                {isCollapsed && !isMobile ? '✗' : 'No'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 hover:bg-red-500/20 hover:text-red-700 rounded-lg transition-colors"
            title={isCollapsed ? 'Logout' : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {(!isCollapsed || isMobile) && (
              <span className="font-medium">Logout</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;