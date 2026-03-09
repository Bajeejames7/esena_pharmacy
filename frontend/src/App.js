import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { initPerformanceMonitoring } from './utils/performance';
import { compatibilityManager } from './utils/browserCompat';
import ErrorBoundary from './components/ErrorBoundary';
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
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
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import ManageProducts from './admin/ManageProducts';
import ManageOrders from './admin/ManageOrders';
import ManageAppointments from './admin/ManageAppointments';
import ManageBlogs from './admin/ManageBlogs';
import ProtectedRoute from './components/ProtectedRoute';

// Component to handle focus management on route changes
const FocusManager = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
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

function App() {
  useEffect(() => {
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Initialize browser compatibility
    if (!compatibilityManager.initialized) {
      compatibilityManager.init();
    }
  }, []);

  return (
    <ErrorBoundary>
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
          <div className="min-h-screen flex flex-col">
            <ConditionalHeader />
            <main 
              id="main-content" 
              className="flex-1" 
              tabIndex="-1"
              role="main"
              aria-label="Main content"
            >
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
            </Routes>
            </main>
            <ConditionalFooter />
            
            {/* WhatsApp floating button - only show on public pages */}
            <Routes>
              <Route path="/admin/*" element={null} />
              <Route path="*" element={<WhatsAppButton />} />
            </Routes>
          </div>
        </FocusManager>
      </Router>
    </CartProvider>
  </ThemeProvider>
  </ErrorBoundary>
  );
}

export default App;