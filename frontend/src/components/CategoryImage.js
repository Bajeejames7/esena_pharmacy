import React, { useState } from 'react';

/**
 * Category Image Component with fallback support
 * Handles image loading states and provides fallbacks
 */
const CategoryImage = ({ 
  src, 
  alt, 
  className = "w-full h-full object-contain",
  fallbackIcon = "💊"
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (imageError) {
    // Fallback to emoji if image fails to load
    return (
      <div className="w-full h-full flex items-center justify-center text-4xl md:text-5xl">
        {fallbackIcon}
      </div>
    );
  }

  return (
    <>
      {!imageLoaded && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-full h-full"></div>
        </div>
      )}
      <img 
        src={src}
        alt={alt}
        className={`${className} ${!imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </>
  );
};

export default CategoryImage;