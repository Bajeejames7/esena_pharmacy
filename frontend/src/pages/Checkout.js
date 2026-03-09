import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { validateOrderForm, validateField } from '../utils/validation';
import { ordersAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import GlassButton from '../components/forms/GlassButton';

/**
 * Checkout page with order form and validation
 * Implements Requirements 5.1, 5.2, 5.11, 15.1, 15.2, 15.3, 15.4, 15.7, 15.8
 */
const Checkout = () => {
  const { items, total, itemCount, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'card'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const stateOptions = [
    { value: '', label: 'Select State' },
    { value: 'AL', label: 'Alabama' },
    { value: 'CA', label: 'California' },
    { value: 'FL', label: 'Florida' },
    { value: 'NY', label: 'New York' },
    { value: 'TX', label: 'Texas' },
    // Add more states as needed
  ];

  const paymentOptions = [
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  const shippingCost = 150; // Fixed shipping cost for Nairobi
  const finalTotal = total + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (errors[name]) {
      const validation = validateField(name, value, formData);
      setErrors(prev => ({
        ...prev,
        [name]: validation.isValid ? null : validation.error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value, formData);
    setErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? null : validation.error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const validation = validateOrderForm(formData);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare order data for API
      const orderPayload = {
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        delivery_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
        notes: formData.paymentMethod,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      // Submit order to API
      const response = await ordersAPI.create(orderPayload);
      
      // Clear cart and redirect to success page
      clearCart();
      navigate('/order-success', { 
        state: { 
          orderData: {
            ...formData,
            items,
            subtotal: total,
            shipping: shippingCost,
            total: finalTotal,
            orderId: response.orderId,
            trackingToken: response.token,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Order submission error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to process order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if cart is empty
  if (itemCount === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h1 className="text-gray-800 mb-4">Checkout</h1>
            <p className="text-gray-600 mb-6">Your cart is empty. Add some items before checkout.</p>
            <GlassButton onClick={() => navigate('/products')}>
              Browse Products
            </GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8">
              <h1 className="text-gray-800 mb-6">Checkout</h1>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassInput
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.name}
                      required
                      autoComplete="name"
                    />
                    
                    <GlassInput
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.email}
                      required
                      autoComplete="email"
                    />
                    
                    <GlassInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.phone}
                      required
                      autoComplete="tel"
                      className="md:col-span-2"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Shipping Address</h2>
                  <div className="space-y-6">
                    <GlassInput
                      label="Street Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={errors.address}
                      required
                      autoComplete="street-address"
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <GlassInput
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.city}
                        required
                        autoComplete="address-level2"
                      />
                      
                      <GlassSelect
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        options={stateOptions}
                        error={errors.state}
                        required
                      />
                      
                      <GlassInput
                        label="ZIP Code"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.zipCode}
                        required
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>
                  <GlassSelect
                    label="Payment Method"
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    options={paymentOptions}
                    required
                  />
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-100/50 border border-red-200 rounded-lg text-red-700">
                    {errors.submit}
                  </div>
                )}

                <GlassButton
                  type="submit"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? 'Processing Order...' : `Place Order - KSh ${finalTotal.toFixed(2)}`}
                </GlassButton>
              </form>
            </GlassCard>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-24">
              <h2 className="text-gray-800 mb-6">Order Summary</h2>
              
              {/* Order Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                      <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800 text-sm">
                      KSh {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-3 border-t border-white/20 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800 dark:text-white">KSh {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping (Nairobi)</span>
                  <span className="text-gray-800">KSh {shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-white/20 pt-3">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800 dark:text-white">KSh {finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;