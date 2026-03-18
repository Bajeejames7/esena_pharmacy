import React from 'react';
import { useCompatibility } from '../utils/browserCompat';

/**
 * Reusable glassmorphism card component with browser compatibility fallbacks
 * Implements Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 28.5
 */
const GlassCard = ({ 
  children, 
  className = '', 
  blur = 'md', 
  opacity = 0.1, 
  hover = false, 
  onClick,
  interactive = false,
  ...props 
}) => {
  const { shouldUseGlassmorphism, getFallbackStyles } = useCompatibility();

  // Blur intensity mapping
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-glass',
    lg: 'backdrop-blur-xl'
  };

  // Validate blur prop
  const validBlur = ['sm', 'md', 'lg'].includes(blur) ? blur : 'md';
  
  // Validate opacity prop (0-1 range)
  const validOpacity = Math.max(0, Math.min(1, opacity));

  // Get fallback styles for unsupported browsers
  const fallbackStyles = getFallbackStyles();

  // Base glass styles - core glassmorphism properties
  const baseClasses = shouldUseGlassmorphism 
    ? `
      ${blurClasses[validBlur]}
      border-2 border-glass-blue/30 
      rounded-glass 
      shadow-glass
      transition-all 
      duration-300
    `
    : `
      border-2 border-blue-200
      rounded-lg
      shadow-lg
      transition-all
      duration-300
      bg-white
    `;

  // Background opacity style
  const backgroundStyle = shouldUseGlassmorphism 
    ? { backgroundColor: `rgba(255, 255, 255, ${validOpacity})` }
    : fallbackStyles;

  // Dark mode background class
  const darkBgClass = shouldUseGlassmorphism ? 'dark:bg-slate-800/50' : 'dark:bg-slate-800';

  // Hover classes
  const hoverClasses = hover 
    ? shouldUseGlassmorphism 
      ? 'hover:shadow-glass-hover hover:bg-white/15 hover:scale-105 hover:border-glass-blue/50 cursor-pointer transform'
      : 'hover:shadow-xl hover:bg-gray-50 hover:scale-105 hover:border-blue-300 cursor-pointer transform'
    : '';

  // Interactive classes
  const interactiveClasses = (onClick || interactive) ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${darkBgClass} ${hoverClasses} ${interactiveClasses} ${className}`}
      style={backgroundStyle}
      onClick={onClick}
      role={onClick ? 'button' : props.role}
      tabIndex={onClick ? 0 : props.tabIndex}
      aria-label={props['aria-label']}
      aria-labelledby={props['aria-labelledby']}
      aria-describedby={props['aria-describedby']}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : props.onKeyDown}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Validate glassmorphism properties for property testing
 * Used to ensure all glass components have required CSS properties
 */
export const validateGlassmorphismProperties = (element) => {
  if (!element) return false;
  
  const computedStyle = window.getComputedStyle(element);
  const classList = element.classList;
  
  // Check for required glassmorphism properties
  const hasBackdropBlur = classList.contains('backdrop-blur-sm') || 
                          classList.contains('backdrop-blur-glass') || 
                          classList.contains('backdrop-blur-xl');
  
  const hasBorder = classList.contains('border') && 
                   (classList.contains('border-white/20') || 
                    computedStyle.borderColor.includes('rgba(255, 255, 255'));
  
  const hasRoundedCorners = classList.contains('rounded-glass') ||
                           computedStyle.borderRadius !== '0px';
  
  const hasShadow = classList.contains('shadow-glass') ||
                   computedStyle.boxShadow !== 'none';
  
  const hasTransition = classList.contains('transition-all') ||
                       computedStyle.transition !== 'all 0s ease 0s';
  
  return hasBackdropBlur && hasBorder && hasRoundedCorners && hasShadow && hasTransition;
};

/**
 * Get glassmorphism style values for testing
 */
export const getGlassmorphismValues = (blur, opacity) => {
  const blurMap = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-glass', 
    lg: 'backdrop-blur-xl'
  };
  
  const clampedOpacity = opacity !== undefined ? Math.max(0, Math.min(1, opacity)) : 0.1;
  
  return {
    blur: blurMap[blur] || blurMap.md,
    opacity: clampedOpacity,
    backgroundColor: `rgba(255, 255, 255, ${clampedOpacity})`
  };
};

export default GlassCard;