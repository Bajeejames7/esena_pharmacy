import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { CustomerAuthProvider, useCustomerAuth } from './contexts/CustomerAuthContext';
import { DriverAuthProvider } from './contexts/DriverAuthContext';
import { initPerformanceMonitoring } from './utils/performance';
import { cacheManager } from './utils/cacheManager';
import { compatibilityManager } from './utils/browserCompat';
import ErrorBoundary from './components/ErrorBoundary';
import ProfileGuard from './components/ProfileGuard';
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
import CustomerLogin from './pages/CustomerLogin';
import CustomerAccount from './pages/CustomerAccount';
import CompleteProfile from './pages/CompleteProfile';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import ManageProducts from './admin/ManageProducts';
import ManageOrders from './admin/ManageOrders';
import ManageAppointments from './admin/ManageAppointments';
import ManageBlogs from './admin/ManageBlogs';
import ManagePrescriptions from './admin/ManagePrescriptions';
import ManageEmployees from './admin/ManageEmployees';
import ManageDrivers from './admin/ManageDrivers';
import ManageDeliveries from './admin/ManageDeliveries';
import ManageCustomers from './admin/ManageCustomers';
import ActivityLog from './admin/ActivityLog';
import AdminProfile from './admin/AdminProfile';
import SalesReport from './admin/SalesReport';
import DriverLogin from './driver/DriverLogin';
import DriverDashboard from './driver/DriverDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';

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
  '/driver/login': 'Driver Login',
  '/driver/dashboard': 'Driver Dashboard',
  '/admin/login': 'Admin Login',
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Manage Products',
  '/admin/orders': 'Manage Orders',
  '/admin/appointments': 'Manage Appointments',
  '/admin/blogs': 'Manage Blogs',
  '/admin/prescriptions': 'Prescriptions',
  '/admin/employees': 'Manage Employees',
  '/admin/drivers': 'Manage Drivers',
  '/admin/deliveries': 'Delivery Tracking',
  '/admin/customers': 'Customers',
  '/admin/activity-log': 'Activity Log',
  '/admin/reports': 'Sales Report',
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
      : 'Esena Pharmacy | Kenya\'s Trusted Pharmacy';

    // Focus the main content area when route changes
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
    }
  }, [location.pathname]);

  return children;
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
          <CustomerAuthProvider>
            <DriverAuthProvider>
              <CartProvider>
              <Router>
                <AppContent 
                  showCookiePreferences={showCookiePreferences}
                  setShowCookiePreferences={setShowCookiePreferences}
                  handleSaveCookiePreferences={handleSaveCookiePreferences}
                />
              </Router>
            </CartProvider>
            </DriverAuthProvider>
          </CustomerAuthProvider>
        </ThemeProvider>
      </GoogleReCaptchaProvider>
    </ErrorBoundary>
  );
}

// Separate component that has access to auth context
const AppContent = ({ showCookiePreferences, setShowCookiePreferences, handleSaveCookiePreferences }) => {
  const location = useLocation();
  const { firebaseUser, customer, needsProfile, loading } = useCustomerAuth();
  
  // Determine if header/footer should be hidden
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDriverRoute = location.pathname.startsWith('/driver');
  
  // Hide header/footer if:
  // 1. Not loading (auth state is known)
  // 2. User is logged in (firebaseUser exists)
  // 3. Profile is incomplete (needsProfile is true OR customer doesn't have required fields)
  const hideHeaderFooter = !loading && firebaseUser && (
    needsProfile || 
    !customer?.profile_completed ||
    !customer?.phone ||
    !customer?.delivery_address ||
    !customer?.city ||
    !customer?.county
  );
  
  // Debug logging
  useEffect(() => {
    console.log('🎯 AppContent State:', {
      loading,
      hasFirebaseUser: !!firebaseUser,
      hasCustomer: !!customer,
      needsProfile,
      profileCompleted: customer?.profile_completed,
      hasPhone: !!customer?.phone,
      hideHeaderFooter,
      pathname: location.pathname
    });
  }, [loading, firebaseUser, customer, needsProfile, hideHeaderFooter, location.pathname]);
  
  return (
    <>
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
        <ProfileGuard>
          <div className="min-h-screen w-full overflow-x-hidden flex flex-col">
            {/* Conditional Header */}
            {!isAdminRoute && !isDriverRoute && !hideHeaderFooter && (
              <>
                <Header />
                <div className="h-16 flex-shrink-0" aria-hidden="true" />
              </>
            )}
            
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
              {/* Customer auth */}
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/account" element={<CustomerAccount />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/upload-prescription" element={<UploadPrescription />} />
              <Route path="/whatsapp-order" element={<WhatsAppOrder />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              
              {/* Driver Routes */}
              <Route path="/driver/login" element={<DriverLogin />} />
              <Route path="/driver/dashboard" element={<DriverDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLogin />} />
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
              <Route path="/admin/drivers" element={
                <ProtectedRoute>
                  <ManageDrivers />
                </ProtectedRoute>
              } />
              <Route path="/admin/deliveries" element={
                <ProtectedRoute>
                  <ManageDeliveries />
                </ProtectedRoute>
              } />
              <Route path="/admin/customers" element={
                <ProtectedRoute>
                  <ManageCustomers />
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
              <Route path="/admin/reports" element={
                <ProtectedRoute>
                  <SalesReport />
                </ProtectedRoute>
              } />

              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </MainContentWrapper>
            
            {/* Conditional Footer */}
            {!isAdminRoute && !isDriverRoute && !hideHeaderFooter && <Footer />}
            
            {/* WhatsApp floating button - only show on public pages when profile complete */}
            {!isAdminRoute && !isDriverRoute && !hideHeaderFooter && <WhatsAppButton />}

            {/* Ivo Bot - only show on public pages when profile complete */}
            {!isAdminRoute && !isDriverRoute && !hideHeaderFooter && <IvoBot />}
            
            {/* Cookie Consent Banner - only show on public pages when profile complete */}
            {!isAdminRoute && !isDriverRoute && !hideHeaderFooter && <CookieConsent />}

            {/* Cookie Settings Button - only show on public pages after consent when profile complete */}
            {!isAdminRoute && !isDriverRoute && !hideHeaderFooter && (
              <CookieSettingsButton 
                onOpenPreferences={() => setShowCookiePreferences(true)} 
              />
            )}

            {/* Cookie Preferences Modal */}
            {showCookiePreferences && (
              <CookiePreferencesModal
                onSave={handleSaveCookiePreferences}
                onClose={() => setShowCookiePreferences(false)}
              />
            )}
          </div>
          </ProfileGuard>
        </FocusManager>
      </>
  );
};

export default App;