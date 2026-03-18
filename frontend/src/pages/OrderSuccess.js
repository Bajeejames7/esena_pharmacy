import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';

/**
 * Order success page
 * Displays order confirmation and tracking information
 */
const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state?.orderData;

  if (!orderData) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h1 className="text-gray-800 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your order information. Please check your email for confirmation details.
            </p>
            <Link to="/" className="glass-button-primary">
              Return Home
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Message */}
        <GlassCard className="p-8 text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-gray-800 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've received your order and will process it shortly.
          </p>
          
          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
            <p className="text-gray-700 mb-2">
              📧 A tracking token has been sent to <span className="font-medium">{orderData.email}</span>. Use it to track your order status.
            </p>
            <p className="text-xs text-amber-600">🔒 Keep your tracking token private — it gives access to your order details. Do not share it with anyone.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/track-order">
              <GlassButton variant="primary">
                Track Your Order
              </GlassButton>
            </Link>
            <Link to="/products">
              <GlassButton variant="secondary">
                Continue Shopping
              </GlassButton>
            </Link>
          </div>
        </GlassCard>

        {/* Order Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <GlassCard className="p-6">
            <h2 className="text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-600 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    KSh {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="space-y-2 border-t border-white/20 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800 dark:text-white">KSh {orderData.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping (Nairobi)</span>
                <span className="text-gray-800">KSh {orderData.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-white/20 pt-2">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800 dark:text-white">KSh {orderData.total.toFixed(2)}</span>
              </div>
            </div>
          </GlassCard>

          {/* Shipping & Contact Info */}
          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-gray-800 mb-4">Shipping Information</h2>
              <div className="space-y-2 text-gray-600">
                <p className="font-medium text-gray-800">{orderData.name}</p>
                <p>{orderData.address}</p>
                <p>{orderData.city}, {orderData.state} {orderData.zipCode}</p>
                <p className="mt-3">
                  <span className="font-medium text-gray-700">Phone:</span> {orderData.phone}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Email:</span> {orderData.email}
                </p>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-gray-800 mb-4">What's Next?</h2>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Order Confirmation</p>
                    <p className="text-sm">You'll receive an email confirmation shortly</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Processing</p>
                    <p className="text-sm">We'll prepare your order for shipment</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Delivery</p>
                    <p className="text-sm">Your order will arrive within 2-3 business days</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;