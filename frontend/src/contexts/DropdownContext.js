import React, { createContext, useContext, useState } from 'react';

/**
 * Context for managing dropdown state across components
 * Used to apply blur effects to page content when dropdowns are open
 */
const DropdownContext = createContext();

export const useDropdown = () => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error('useDropdown must be used within a DropdownProvider');
  }
  return context;
};

export const DropdownProvider = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const openDropdown = () => setIsDropdownOpen(true);
  const closeDropdown = () => setIsDropdownOpen(false);

  return (
    <DropdownContext.Provider value={{
      isDropdownOpen,
      openDropdown,
      closeDropdown
    }}>
      {children}
    </DropdownContext.Provider>
  );
};