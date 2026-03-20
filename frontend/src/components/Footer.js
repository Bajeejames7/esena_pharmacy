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
                Kenya's trusted online pharmacy delivering quality medicines and professional pharmaceutical services nationwide. Order online and get your medications delivered to your doorstep anywhere in Kenya.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Links */}
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-glass-blue dark:hover:text-blue-400 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
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
