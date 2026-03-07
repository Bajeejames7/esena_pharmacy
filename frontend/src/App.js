import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
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
import Blog from './pages/Blog';
import TrackOrder from './pages/TrackOrder';
import AdminLogin from './admin/Login';
import AdminDashboard from './admin/Dashboard';
import ManageProducts from './admin/ManageProducts';
import ManageOrders from './admin/ManageOrders';
import ManageAppointments from './admin/ManageAppointments';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetails />} />
              <Route path="/supplements" element={<Supplements />} />
              <Route path="/personal-care" element={<PersonalCare />} />
              <Route path="/appointments" element={<BookAppointment />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/track/:token" element={<TrackOrder />} />
              
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
            </Routes>
          </main>
          <Footer />
          
          {/* WhatsApp floating button - only show on public pages */}
          <Routes>
            <Route path="/admin/*" element={null} />
            <Route path="*" element={<WhatsAppButton />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;