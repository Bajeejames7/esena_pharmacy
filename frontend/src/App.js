import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { initPerformanceMonitoring } from './utils/performance';
import { cacheManager } from './utils/cacheManager';
import { compatibilityManager } from './utils/browserCompat';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import CookieConsent from './components/CookieConsent';
import CookieSettingsButton, { CookiePreferencesModal } from './components/CookieSettingsButton';
import IvoBot from './components/IvoBot';
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import BookAppointment from './pages/BookAppointment';
import Contact from './pages/Contact';
import Supplements from './pages/Supplements';
import PersonalCare from './pages/PersonalCare';
import Shop from './pages/Shop';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import TrackOrder from './pages/TrackOrder';
import TrackAppointment from './pages/TrackAppointment';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import UploadPrescription from './pages/UploadPrescription';
import Delivery from './pages/Delivery';
import WhatsAppOrder from './pages/WhatsAppOrder';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import ManageProducts from './admin/ManageProducts';
import ManageOrders from './admin/ManageOrders';
import ManageAppointments from './admin/ManageAppointments';
import ManageBlogs from './admin/ManageBlogs';
import ManagePrescriptions from './admin/ManagePrescriptions';
import ManageEmployees from './admin/ManageEmployees';
import ActivityLog from './admin/ActivityLog';
import AdminProfile from './admin/AdminProfile';
import ProtectedRoute from './components/ProtectedRoute';

// Page titles per route
const PAGE_TITLES = {
  '/': 'Home',
  '/about': 'About Us',
  '/products': 'Products',
  '/supplements': 'Vitamins & Supplements',
  '/personal-care': 'Personal Care',
  '/book-appointment': 'Book Appointment',
  '/contact': 'Contact Us',
  '/shop': 'Shop',
  '/checkout': 'Checkout',
  '/order-success': 'Order Confirmed',
  '/blog': 'Blog',
  '/delivery': 'Delivery Info',
  '/upload-prescription': 'Upload Prescription',
  '/whatsapp-order': 'WhatsApp Order',
  '/privacy-policy': 'Privacy Policy',
  '/terms': 'Terms of Use',
  '/track-order': 'Track Order',
  '/admin/login': 'Admin Login',
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Manage Products',
  '/admin/orders': 'Manage Orders',
  '/admin/appointments': 'Manage Appointments',
  '/admin/blogs': 'Manage Blogs',
  '/admin/prescriptions': 'Prescriptions',
};

// Component to handle focus management and page title on route changes
const FocusManager = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Update page title
    const match = Object.keys(PAGE_TITLES).find(path =>
      path !== '/' ? location.pathname.startsWith(path) : location.pathname === '/'
    );
    const pageTitle = match ? PAGE_TITLES[match] : null;
    document.title = pageTitle
      ? `${pageTitle} | Esena Pharmacy`
      : 'Esena Pharmacy | Kenya\'s Trusted Online Pharmacy';

    // Focus the main content area when route changes
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [location.pathname]);

  return children;
};

// Component to conditionally render Header based on route
const ConditionalHeader = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Don't render Header on admin routes
  if (isAdminRoute) {
    return null;
  }
  
  return <Header />;
};

// Component to conditionally render Footer based on route
const ConditionalFooter = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Don't render Footer on admin routes
  if (isAdminRoute) {
    return null;
  }
  
  return <Footer />;
};

// Main content wrapper
const MainContentWrapper = ({ children }) => {
  return (
    <main 
      id="main-content" 
      className="flex-1 w-full overflow-x-hidden"
      tabIndex="-1"
      role="main"
      aria-label="Main content"
    >
      {children}
    </main>
  );
};

function App() {
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);

  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Initialize performance system
    cacheManager.init().catch(e => 
      console.warn('Performance system running in basic mode:', e.message)
    );
    
    // Initialize browser compatibility
    if (!compatibilityManager.initialized) {
      compatibilityManager.init();
    }
  }, []);

  const handleSaveCookiePreferences = (preferences) => {
    const consent = {
      necessary: true, // Always required
      ...preferences,
      timestamp: Date.now()
    };
    
    // Import CookieCache here to avoid circular dependency
    import('./utils/cacheManager').then(({ CookieCache }) => {
      CookieCache.set('cookie_consent', consent, 365);
      setShowCookiePreferences(false);
      // Reload to apply new settings
      window.location.reload();
    });
  };

  return (
    <ErrorBoundary>
      <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || ''}>
        <ThemeProvider>
          <CartProvider>
          <Router>
          {/* Skip Links for keyboard navigation */}
          <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50">
            <a 
              href="#main-content" 
              className="glass-button-primary p-2 m-2 rounded"
              onFocus={(e) => e.target.classList.remove('sr-only')}
              onBlur={(e) => e.target.classList.add('sr-only')}
            >
              Skip to main content
            </a>
            <a 
              href="#navigation" 
              className="glass-button-secondary p-2 m-2 rounded ml-2"
              onFocus={(e) => e.target.classList.remove('sr-only')}
              onBlur={(e) => e.target.classList.add('sr-only')}
            >
              Skip to navigation
            </a>
          </div>

          <FocusManager>
          <div className="min-h-screen w-full overflow-x-hidden flex flex-col">
            <ConditionalHeader />
            <MainContentWrapper>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/supplements" element={<Supplements />} />
              <Route path="/personal-care" element={<PersonalCare />} />
              <Route path="/book-appointment" element={<BookAppointment />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/track/:token" element={<TrackOrder />} />
              <Route path="/track-order" element={<TrackOrder />} />
              <Route path="/track-appointment/:token" element={<TrackAppointment />} />
              <Route path="/track-appointment" element={<TrackAppointment />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/upload-prescription" element={<UploadPrescription />} />
              <Route path="/whatsapp-order" element={<WhatsAppOrder />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute>
                  <ManageProducts />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute>
                  <ManageOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/appointments" element={
                <ProtectedRoute>
                  <ManageAppointments />
                </ProtectedRoute>
              } />
              <Route path="/admin/blogs" element={
                <ProtectedRoute>
                  <ManageBlogs />
                </ProtectedRoute>
              } />
              <Route path="/admin/prescriptions" element={
                <ProtectedRoute>
                  <ManagePrescriptions />
                </ProtectedRoute>
              } />
              <Route path="/admin/employees" element={
                <ProtectedRoute>
                  <ManageEmployees />
                </ProtectedRoute>
              } />
              <Route path="/admin/activity-log" element={
                <ProtectedRoute>
                  <ActivityLog />
                </ProtectedRoute>
              } />
              <Route path="/admin/profile" element={
                <ProtectedRoute>
                  <AdminProfile />
                </ProtectedRoute>
              } />
            </Routes>
            </MainContentWrapper>
            <ConditionalFooter />
            
            {/* WhatsApp floating button - only show on public pages */}
            <Routes>
              <Route path="/admin/*" element={null} />
              <Route path="*" element={<WhatsAppButton />} />
            </Routes>

            {/* Ivo Bot - only show on public pages */}
            <Routes>
              <Route path="/admin/*" element={null} />
              <Route path="*" element={<IvoBot />} />
            </Routes>
            
            {/* Cookie Consent Banner - only show on public pages */}
            <Routes>
              <Route path="/admin/*" element={null} />
              <Route path="*" element={<CookieConsent />} />
            </Routes>

            {/* Cookie Settings Button - only show on public pages after consent */}
            <Routes>
              <Route path="/admin/*" element={null} />
              <Route path="*" element={
                <CookieSettingsButton 
                  onOpenPreferences={() => setShowCookiePreferences(true)} 
                />
              } />
            </Routes>

            {/* Cookie Preferences Modal */}
            {showCookiePreferences && (
              <CookiePreferencesModal
                onSave={handleSaveCookiePreferences}
                onClose={() => setShowCookiePreferences(false)}
              />
            )}
          </div>
        </FocusManager>
      </Router>
    </CartProvider>
  </ThemeProvider>
  </GoogleReCaptchaProvider>
  </ErrorBoundary>
  );
}

export default App;