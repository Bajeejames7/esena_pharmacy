import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBreakpoint } from '../utils/responsive';
import LazyImage from './LazyImage';

const BrandingSlider = () => {
  const { breakpoint } = useBreakpoint();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageAspectRatios, setImageAspectRatios] = useState({});

  const brandingImages = [
    { 
      src: '/branding1.1.jpeg', 
      alt: 'Esena Pharmacy Branding 1.1', 
      aspectRatio: 'wide',
      objectFit: 'cover',
      objectPosition: 'center',
      link: '/', // Stay on home
      description: 'Home'
    },
    { 
      src: '/branding1.2.jpeg', 
      alt: 'Esena Pharmacy Branding 1.2', 
      aspectRatio: 'wide',
      objectFit: 'cover',
      objectPosition: 'center',
      link: '/book-appointment', // Book appointment
      description: 'Book Appointment'
    },
    { 
      src: '/branding2.1.jpeg', 
      alt: 'Esena Pharmacy Branding 2.1', 
      aspectRatio: 'wide',
      objectFit: 'cover',
      objectPosition: 'center',
      link: '/personal-care', // Personal care
      description: 'Personal Care'
    },
    { 
      src: '/branding2.2.jpeg', 
      alt: 'Esena Pharmacy Branding 2.2', 
      aspectRatio: 'wide',
      objectFit: 'cover',
      objectPosition: 'center',
      link: '/personal-care', // Personal care
      description: 'Personal Care'
    },
    { 
      src: '/branding3.1.jpeg', 
      alt: 'Esena Pharmacy Branding 3.1', 
      aspectRatio: 'wide',
      objectFit: 'cover',
      objectPosition: 'center',
      link: '/personal-care', // Personal care
      description: 'Personal Care'
    },
    { 
      src: '/branding3.2.jpeg', 
      alt: 'Esena Pharmacy Branding 3.2', 
      aspectRatio: 'wide',
      objectFit: 'cover',
      objectPosition: 'center',
      link: '/personal-care', // Personal care
      description: 'Personal Care'
    },
    { 
      src: '/branding4.1.jpeg', 
      alt: 'Esena Pharmacy Branding 4.1', 
      aspectRatio: 'square',
      objectFit: 'contain',
      objectPosition: 'center',
      link: '/about', // About us
      description: 'About Us'
    },
    { 
      src: '/branding4.2.jpeg', 
      alt: 'Esena Pharmacy Branding 4.2', 
      aspectRatio: 'square',
      objectFit: 'contain',
      objectPosition: 'center',
      link: '/contact', // Contact
      description: 'Contact Us'
    },
    { 
      src: '/branding4.3.jpeg', 
      alt: 'Esena Pharmacy Branding 4.3', 
      aspectRatio: 'square',
      objectFit: 'contain',
      objectPosition: 'center',
      link: '/upload-prescription', // Upload prescription
      description: 'Upload Prescription'
    }
  ];

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % brandingImages.length);
    }, 4000);

    return () => clearInterval(slideInterval);
  }, [brandingImages.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % brandingImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + brandingImages.length) % brandingImages.length);
  };

  // Handle image load to detect actual dimensions
  const handleImageLoad = (index, event) => {
    const img = event.target;
    const aspectRatio = img.naturalWidth / img.naturalHeight;
    
    setImageAspectRatios(prev => ({
      ...prev,
      [index]: {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: aspectRatio,
        isWide: aspectRatio > 1.5,
        isSquare: aspectRatio >= 0.8 && aspectRatio <= 1.2,
        isTall: aspectRatio < 0.8
      }
    }));
  };

  const getSliderHeight = () => {
    // Adjust height based on current image type for better display
    const currentImage = brandingImages[currentSlide];
    const baseHeight = {
      mobile: currentImage?.aspectRatio === 'square' ? 'h-96' : 'h-80',
      tablet: currentImage?.aspectRatio === 'square' ? 'h-[28rem]' : 'h-96', 
      desktop: currentImage?.aspectRatio === 'square' ? 'h-[32rem]' : 'h-[28rem]'
    };

    if (breakpoint === 'mobile') return `${baseHeight.mobile} sm:h-96`;
    if (breakpoint === 'tablet') return `${baseHeight.tablet} md:h-[28rem]`;
    return `${baseHeight.desktop} lg:h-[32rem]`;
  };

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative group">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {brandingImages.map((image, index) => {
            const detectedRatio = imageAspectRatios[index];
            const isSquareOrTall = detectedRatio?.isSquare || detectedRatio?.isTall || image.aspectRatio === 'square';
            const isWideImage = detectedRatio?.isWide || (!detectedRatio && image.aspectRatio === 'wide');
            
            // On mobile, use object-contain for wide images to prevent cropping
            const mobileObjectFit = breakpoint === 'mobile' && isWideImage ? 'contain' : 
                                   isSquareOrTall ? 'contain' : image.objectFit;
            
            return (
              <div key={index} className="w-full flex-shrink-0">
                <Link 
                  to={image.link}
                  className="block w-full h-full cursor-pointer group"
                  aria-label={`Navigate to ${image.description}`}
                >
                  <div className={`relative ${getSliderHeight()} ${
                    isSquareOrTall || (breakpoint === 'mobile' && isWideImage)
                      ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900' 
                      : ''
                  } transition-transform duration-300 group-hover:scale-[1.02]`}>
                    <LazyImage
                      src={image.src}
                      alt={image.alt}
                      className={`w-full h-full object-${mobileObjectFit} object-${image.objectPosition} transition-all duration-300 group-hover:brightness-110`}
                      priority={index === 0} // First image loads immediately
                      preload={index < 3} // Preload first 3 images
                      onLoad={(e) => handleImageLoad(index, e)}
                    />
                    {/* Overlay for images with backgrounds */}
                    {(isSquareOrTall || (breakpoint === 'mobile' && isWideImage)) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-black/5 group-hover:from-black/10"></div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-200 z-10"
          aria-label="Previous slide"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 shadow-lg transition-all duration-200 z-10"
          aria-label="Next slide"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 flex z-10 ${
          breakpoint === 'mobile' ? 'space-x-2' : 'space-x-3'
        }`}>
          {brandingImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`${
                breakpoint === 'mobile' ? 'w-2 h-2' : 'w-3 h-3'
              } rounded-full transition-all duration-200 ${
                currentSlide === index
                  ? 'bg-white shadow-lg scale-125'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1 bg-black/20">
        <div 
          className="h-full bg-gradient-to-r from-glass-blue to-glass-green transition-all duration-100 ease-linear"
          style={{ width: `${((currentSlide + 1) / brandingImages.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default BrandingSlider;