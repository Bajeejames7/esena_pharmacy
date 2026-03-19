import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LazyImage from './LazyImage';
import { useBreakpoint } from '../utils/responsive';

const BrandingSlider = () => {
  const { breakpoint } = useBreakpoint();
  const [currentSlide, setCurrentSlide] = useState(0);

  const brandingImages = [
    { src: '/branding1.1.webp', alt: 'Esena Pharmacy Branding 1.1', aspectRatio: 'wide', objectFit: 'cover', objectPosition: 'center', link: '/', description: 'Home' },
    { src: '/branding1.2.webp', alt: 'Esena Pharmacy Branding 1.2', aspectRatio: 'wide', objectFit: 'cover', objectPosition: 'center', link: '/book-appointment', description: 'Book Appointment' },
    { src: '/branding2.1.webp', alt: 'Esena Pharmacy Branding 2.1', aspectRatio: 'wide', objectFit: 'cover', objectPosition: 'center', link: '/personal-care', description: 'Personal Care' },
    { src: '/branding2.2.webp', alt: 'Esena Pharmacy Branding 2.2', aspectRatio: 'wide', objectFit: 'cover', objectPosition: 'center', link: '/personal-care', description: 'Personal Care' },
    { src: '/branding3.1.webp', alt: 'Esena Pharmacy Branding 3.1', aspectRatio: 'wide', objectFit: 'cover', objectPosition: 'center', link: '/personal-care', description: 'Personal Care' },
    { src: '/branding3.2.webp', alt: 'Esena Pharmacy Branding 3.2', aspectRatio: 'wide', objectFit: 'cover', objectPosition: 'center', link: '/personal-care', description: 'Personal Care' },
    { src: '/branding4.1.webp', alt: 'Esena Pharmacy Branding 4.1', aspectRatio: 'square', objectFit: 'contain', objectPosition: 'center', link: '/about', description: 'About Us' },
    { src: '/branding4.2.webp', alt: 'Esena Pharmacy Branding 4.2', aspectRatio: 'square', objectFit: 'contain', objectPosition: 'center', link: '/contact', description: 'Contact Us' },
    { src: '/branding4.3.webp', alt: 'Esena Pharmacy Branding 4.3', aspectRatio: 'square', objectFit: 'contain', objectPosition: 'center', link: '/upload-prescription', description: 'Upload Prescription' },
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



  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative group">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {brandingImages.map((image, index) => {
            const desktopHeight = breakpoint === 'desktop' ? '420px' : breakpoint === 'tablet' ? '320px' : '220px';

            return (
              <div key={index} className="w-full flex-shrink-0">
                <Link
                  to={image.link}
                  className="block w-full cursor-pointer group"
                  aria-label={`Navigate to ${image.description}`}
                >
                  {/* Fixed aspect ratio container prevents CLS */}
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      height: desktopHeight,
                      backgroundColor: '#e5e7eb' /* placeholder bg while image loads */
                    }}
                  >
                    <LazyImage
                      src={image.src}
                      alt={image.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:brightness-110"
                      priority={index === 0}
                      preload={index < 3}
                    />
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