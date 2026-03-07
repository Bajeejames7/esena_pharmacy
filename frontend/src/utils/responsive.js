import { useState, useEffect } from 'react';

/**
 * Responsive utility functions for Esena Pharmacy
 * Implements Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

// Breakpoint definitions matching Tailwind config
export const BREAKPOINTS = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1024 },
  desktop: { min: 1025, max: Infinity }
};

/**
 * Apply responsive breakpoint based on window width
 * Ensures every window width maps to exactly one breakpoint
 * @param {number} windowWidth - Window width in pixels
 * @returns {string} Breakpoint name ('mobile', 'tablet', 'desktop')
 */
export function applyResponsiveBreakpoint(windowWidth) {
  if (windowWidth <= BREAKPOINTS.mobile.max) {
    return 'mobile';
  } else if (windowWidth >= BREAKPOINTS.tablet.min && windowWidth <= BREAKPOINTS.tablet.max) {
    return 'tablet';
  } else {
    return 'desktop';
  }
}

/**
 * Calculate responsive layout configuration
 * @param {string} breakpoint - Breakpoint name ('mobile', 'tablet', 'desktop')
 * @returns {object} Layout configuration object
 */
export function calculateResponsiveLayout(breakpoint) {
  switch (breakpoint) {
    case 'mobile':
      return {
        columns: 1,
        padding: '16px',
        fontSize: '14px',
        borderRadius: '12px',
        headerHeight: '60px',
        sidebarCollapsed: true,
        gridGap: '12px'
      };
    case 'tablet':
      return {
        columns: 2,
        padding: '24px',
        fontSize: '16px',
        borderRadius: '16px',
        headerHeight: '70px',
        sidebarCollapsed: false,
        gridGap: '16px'
      };
    case 'desktop':
    default:
      return {
        columns: 3,
        padding: '32px',
        fontSize: '16px',
        borderRadius: '20px',
        headerHeight: '80px',
        sidebarCollapsed: false,
        gridGap: '24px'
      };
  }
}

/**
 * Validate breakpoint coverage - ensures every width maps to exactly one breakpoint
 * Used for property testing
 */
export const validateBreakpointCoverage = (width) => {
  const breakpoint = applyResponsiveBreakpoint(width);
  const breakpointDef = BREAKPOINTS[breakpoint];
  
  return width >= breakpointDef.min && width <= breakpointDef.max;
};

/**
 * Get breakpoint boundaries for testing
 */
export const getBreakpointBoundaries = () => [
  BREAKPOINTS.mobile.max,
  BREAKPOINTS.tablet.min,
  BREAKPOINTS.tablet.max,
  BREAKPOINTS.desktop.min
];

/**
 * Custom hook for responsive behavior
 * @returns {object} Current breakpoint and layout configuration
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState(() => 
    typeof window !== 'undefined' ? applyResponsiveBreakpoint(window.innerWidth) : 'desktop'
  );
  const [layout, setLayout] = useState(() => calculateResponsiveLayout(breakpoint));

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const newBreakpoint = applyResponsiveBreakpoint(window.innerWidth);
      setBreakpoint(newBreakpoint);
      setLayout(calculateResponsiveLayout(newBreakpoint));
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return { 
    breakpoint, 
    layout,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop'
  };
}