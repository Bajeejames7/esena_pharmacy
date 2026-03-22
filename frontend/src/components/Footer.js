import { Link } from 'react-router-dom';
import GlassCard from './GlassCard';

/**
 * Footer component with glassmorphism styling and dark theme support
 * Implements Requirement 1.1
 */
const Footer = () => {
  return (
    <footer className="mt-16">
      <GlassCard className="mx-2 sm:mx-4 mb-4" blur="lg" opacity={0.1}>
        <div className="px-3 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="mb-4">
                <img 
                  src="/full_logo.webp" 
                  alt="Esena Pharmacy Logo" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Kenya's trusted pharmacy delivering quality medicines and professional pharmaceutical services nationwide. Order online and get your medications delivered to your doorstep anywhere in Kenya.
              </p>
              <div className="flex space-x-4">
                {/* TikTok */}
                <a href="https://www.tiktok.com/@esene_pharmacy?_r=1&_t=ZS-94stcjkjv5Z" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110" aria-label="TikTok">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="6" fill="#010101"/>
                    <path d="M17.59 8.19a4.83 4.83 0 0 1-3.27-3.75V4h-2.45v10.17a1.89 1.89 0 0 1-1.88 1.6 1.89 1.89 0 0 1-1.89-1.89 1.89 1.89 0 0 1 1.89-1.89c.18 0 .36.03.53.07V9.51a5.34 5.34 0 0 0-.53-.03 5.34 5.34 0 0 0-5.34 5.34 5.34 5.34 0 0 0 5.34 5.34 5.34 5.34 0 0 0 5.33-5.34V9.19a7.18 7.18 0 0 0 3.78 1.07V7.75a4.85 4.85 0 0 1-1.51-.44z" fill="white"/>
                    <path d="M17.59 8.19a4.83 4.83 0 0 1-3.27-3.75V4h-2.45v10.17a1.89 1.89 0 0 1-1.88 1.6 1.89 1.89 0 0 1-1.89-1.89 1.89 1.89 0 0 1 1.89-1.89c.18 0 .36.03.53.07V9.51a5.34 5.34 0 0 0-.53-.03 5.34 5.34 0 0 0-5.34 5.34 5.34 5.34 0 0 0 5.34 5.34 5.34 5.34 0 0 0 5.33-5.34V9.19a7.18 7.18 0 0 0 3.78 1.07V7.75a4.85 4.85 0 0 1-1.51-.44z" fill="#69C9D0" fillOpacity="0.6"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/esena_pharmacy?igsh=MTVtMnJka2Z1NTdocw==" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110" aria-label="Instagram">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                        <stop offset="0%" stopColor="#fdf497"/>
                        <stop offset="5%" stopColor="#fdf497"/>
                        <stop offset="45%" stopColor="#fd5949"/>
                        <stop offset="60%" stopColor="#d6249f"/>
                        <stop offset="90%" stopColor="#285AEB"/>
                      </radialGradient>
                    </defs>
                    <rect width="24" height="24" rx="6" fill="url(#ig-grad)"/>
                    <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zm5-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM12 3c-2.44 0-2.75.01-3.71.05C5.35 3.19 3.19 5.35 3.05 8.29 3.01 9.25 3 9.56 3 12s.01 2.75.05 3.71c.14 2.94 2.3 5.1 5.24 5.24.96.04 1.27.05 3.71.05s2.75-.01 3.71-.05c2.93-.14 5.1-2.3 5.24-5.24.04-.96.05-1.27.05-3.71s-.01-2.75-.05-3.71C20.81 5.35 18.65 3.19 15.71 3.05 14.75 3.01 14.44 3 12 3zm0 1.62c2.4 0 2.69.01 3.64.05 2.17.1 3.19 1.14 3.29 3.29.04.95.05 1.24.05 3.64s-.01 2.69-.05 3.64c-.1 2.15-1.12 3.19-3.29 3.29-.95.04-1.23.05-3.64.05s-2.69-.01-3.64-.05c-2.17-.1-3.19-1.14-3.29-3.29C5.03 14.69 5.02 14.4 5.02 12s.01-2.69.05-3.64c.1-2.15 1.12-3.19 3.29-3.29.95-.04 1.24-.05 3.64-.05z" fill="white"/>
                  </svg>
                </a>
                {/* X (Twitter) */}
                <a href="https://x.com/esenapharmacy?s=11" target="_blank" rel="noopener noreferrer" className="transition-transform duration-200 hover:scale-110" aria-label="X (Twitter)">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect width="24" height="24" rx="6" fill="#000000"/>
                    <path d="M13.644 10.634L18.844 4.5h-1.234l-4.52 5.26L9.35 4.5H5.1l5.46 7.948L5.1 19.5h1.234l4.773-5.553 3.813 5.553H19.1l-5.456-8.866zm-1.69 1.965l-.553-.791-4.4-6.294h1.894l3.55 5.079.553.791 4.617 6.604h-1.894l-3.767-5.389z" fill="white"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 text-sm">
                    Medicines
                  </Link>
                </li>
                <li>
                  <Link to="/supplements" className="text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 text-sm">
                    Supplements
                  </Link>
                </li>
                <li>
                  <Link to="/personal-care" className="text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 text-sm">
                    Personal Care
                  </Link>
                </li>
                <li>
                  <Link to="/book-appointment" className="text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 text-sm">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link to="/upload-prescription" className="text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 text-sm">
                    Upload Prescription
                  </Link>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Online Consultation</span>
                </li>
                <li>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Pharmacist Consultation</span>
                </li>
                <li>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Nationwide Delivery</span>
                </li>
                <li>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">WhatsApp Orders</span>
                </li>
                <li>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">Health Supplements</span>
                </li>
              </ul>
            </div>

            {/* Physical Shops */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Physical Shops</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-200 text-sm mb-1">Ruaraka Branch</h4>
                  <a 
                    href="https://maps.app.goo.gl/aNLgSwfv4Nzw9Aj5A" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start space-x-2 text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 group"
                  >
                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 mt-1 group-hover:text-glass-blue dark:group-hover:text-blue-400 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs leading-relaxed">Outering Road Behind Eastmart Supermarket, Ruaraka, Nairobi</span>
                  </a>
                  <a 
                    href="tel:0768103599" 
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 group mt-1"
                  >
                    <svg className="w-3 h-3 text-gray-500 dark:text-gray-400 group-hover:text-glass-blue dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-xs">0768103599</span>
                  </a>
                </div>
                
                <div className="pt-2 border-t border-gray-200/20 dark:border-gray-600/20">
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    More locations coming soon across Kenya
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 pt-8 border-t border-white/20 dark:border-slate-600/30">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                  © 2026 Esena Pharmacy. All rights reserved.
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <a 
                    href="mailto:esenapharmacy@gmail.com" 
                    className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 group text-sm"
                  >
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-glass-blue dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>esenapharmacy@gmail.com</span>
                  </a>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Nationwide delivery across Kenya
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <Link to="/privacy-policy" className="text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 text-sm">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 text-sm">
                  Terms of Service
                </Link>
                <button
                  onClick={() => {
                    document.cookie = 'cookie_consent=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
                    window.location.reload();
                  }}
                  className="text-gray-600 dark:text-gray-300 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200 text-sm"
                >
                  Cookie Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </footer>
  );
};

export default Footer;
