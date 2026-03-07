import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from '../components/GlassCard';
import GlassInput from '../components/forms/GlassInput';
import GlassButton from '../components/forms/GlassButton';

/**
 * Track Order page with enhanced UI and status timeline
 * Implements Requirements 6.1, 6.5, 6.6, 6.7
 */
const TrackOrder = () => {
  const { token } = useParams();
  const { breakpoint } = useBreakpoint();
  const [trackingToken, setTrackingToken] = useState(token || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-track if token is provided in URL
  useEffect(() => {
    const autoTrack = async () => {
      if (token && token !== 'demo') {
        await handleTrackOrder();
      } else if (token === 'demo') {
        // Load demo data for demonstration
        setOrderData({
          id: 'ORD-DEMO123',
          token: 'DEMO-TOKEN-123',
          status: 'dispatched',
          total: 89.99,
          subtotal: 82.99,
          shipping: 0,
          tax: 7.00,
          items: [
            { id: 1, name: 'Vitamin D3 Supplement', quantity: 2, price: 15.99, category: 'Supplement' },
            { id: 2, name: 'Pain Relief Tablets', quantity: 3, price: 8.50, category: 'Medication' },
            { id: 3, name: 'Hand Sanitizer', quantity: 1, price: 4.99, category: 'Personal Care' }
          ],
          customer: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            address: '123 Main Street, City, State 12345'
          },
          createdAt: '2024-03-01T10:00:00Z',
          estimatedDelivery: '2024-03-05T17:00:00Z'
        });
      }
    };
    
    autoTrack();
  }, [token]); // Only depend on token, not handleTrackOrder

  const handleTrackOrder = async (e) => {
    if (e) e.preventDefault();
    
    const tokenToTrack = trackingToken.trim();
    if (!tokenToTrack) {
      setError('Please enter a tracking token');
      return;
    }

    setLoading(true);
    setError('');
    setOrderData(null);
    
    try {
      // TODO: Implement actual API call to track order
      console.log('Tracking order:', tokenToTrack);
      
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate different responses based on token
      if (tokenToTrack.toLowerCase().includes('notfound') || tokenToTrack.length < 5) {
        throw new Error('Order not found');
      }
      
      // Generate realistic demo data
      const statuses = ['pending', 'processing', 'dispatched', 'delivered'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      setOrderData({
        id: `ORD-${tokenToTrack.slice(0, 8).toUpperCase()}`,
        token: tokenToTrack,
        status: randomStatus,
        total: 89.99,
        subtotal: 82.99,
        shipping: 0,
        tax: 7.00,
        items: [
          { id: 1, name: 'Vitamin D3 Supplement', quantity: 2, price: 15.99, category: 'Supplement' },
          { id: 2, name: 'Pain Relief Tablets', quantity: 3, price: 8.50, category: 'Medication' },
          { id: 3, name: 'Hand Sanitizer', quantity: 1, price: 4.99, category: 'Personal Care' }
        ],
        customer: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '(555) 123-4567',
          address: '123 Main Street, City, State 12345'
        },
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedDelivery: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
      });
    } catch (err) {
      setError('Order not found. Please check your tracking token and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: '⏳',
          message: 'Your order has been received and is being processed.'
        };
      case 'processing':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: '📦',
          message: 'Your order is being prepared for shipment.'
        };
      case 'dispatched':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: '🚚',
          message: 'Your order has been dispatched and is on its way.'
        };
      case 'delivered':
        return {
          color: 'text-green-800',
          bgColor: 'bg-green-200',
          icon: '✅',
          message: 'Your order has been delivered successfully.'
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: '❓',
          message: 'Order status unknown.'
        };
    }
  };

  const getStatusTimeline = (currentStatus) => {
    const statuses = [
      { key: 'pending', label: 'Order Placed', description: 'Order received and confirmed' },
      { key: 'processing', label: 'Processing', description: 'Preparing your order' },
      { key: 'dispatched', label: 'Dispatched', description: 'Order shipped and in transit' },
      { key: 'delivered', label: 'Delivered', description: 'Order delivered successfully' }
    ];

    const currentIndex = statuses.findIndex(s => s.key === currentStatus);
    
    return statuses.map((status, index) => ({
      ...status,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-gray-800 dark:text-white mb-4">Track Your Order</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Enter your tracking token to view your order status and delivery information.
          </p>
        </GlassCard>

        {/* Tracking Form */}
        {!orderData && (
          <GlassCard className="p-8 mb-8">
            <form onSubmit={handleTrackOrder} className="max-w-md mx-auto">
              <GlassInput
                label="Tracking Token"
                name="trackingToken"
                value={trackingToken}
                onChange={(e) => setTrackingToken(e.target.value)}
                error={error}
                placeholder="Enter your tracking token (e.g., ABC123XYZ)"
                required
                className="mb-6"
              />
              
              <GlassButton
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Tracking Order...' : 'Track Order'}
              </GlassButton>
            </form>

            {/* Demo Instructions */}
            <div className="mt-8 p-4 bg-blue-50/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Demo Instructions</h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm">
                Try entering any token (at least 5 characters) to see a demo order, 
                or use "notfound" to test error handling.
              </p>
            </div>
          </GlassCard>
        )}

        {/* Order Details */}
        {orderData && (
          <div className={`grid gap-8 ${breakpoint === 'desktop' ? 'grid-cols-3' : 'grid-cols-1'}`}>
            {/* Order Status and Timeline */}
            <div className={breakpoint === 'desktop' ? 'col-span-2' : ''}>
              {/* Status Card */}
              <GlassCard className="p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-gray-800 dark:text-white">Order Status</h2>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setOrderData(null);
                      setTrackingToken('');
                      setError('');
                    }}
                  >
                    Track Another Order
                  </GlassButton>
                </div>
                
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${getStatusInfo(orderData.status).bgColor}`}>
                    {getStatusInfo(orderData.status).icon}
                  </div>
                  <div>
                    <p className={`text-xl font-semibold capitalize ${getStatusInfo(orderData.status).color}`}>
                      {orderData.status}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300">{getStatusInfo(orderData.status).message}</p>
                  </div>
                </div>

                {/* Order Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Order ID</p>
                    <p className="font-mono text-gray-800 dark:text-white">{orderData.id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Tracking Token</p>
                    <p className="font-mono text-gray-800 dark:text-white">{orderData.token}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Order Date</p>
                    <p className="text-gray-800 dark:text-white">{new Date(orderData.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Estimated Delivery</p>
                    <p className="text-gray-800 dark:text-white">
                      {orderData.status === 'delivered' 
                        ? 'Delivered' 
                        : new Date(orderData.estimatedDelivery).toLocaleDateString()
                      }
                    </p>
                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 dark:text-white">Order Timeline</h3>
                  <div className="space-y-3">
                    {getStatusTimeline(orderData.status).map((step, index) => (
                      <div key={step.key} className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.completed 
                            ? 'bg-green-500 text-white' 
                            : step.active 
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.completed ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            step.completed || step.active ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className={`text-sm ${
                            step.completed || step.active ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassCard>

              {/* Order Items */}
              <GlassCard className="p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Order Items</h3>
                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">IMG</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">{item.category}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-white">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Order Summary and Customer Info */}
            <div className="space-y-6">
              {/* Order Summary */}
              <GlassCard className="p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-800">${orderData.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-800">
                      {orderData.shipping === 0 ? 'Free' : `$${orderData.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-gray-800">${orderData.tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="font-semibold text-gray-800">${orderData.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Customer Information */}
              <GlassCard className="p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Delivery Information</h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{orderData.customer.name}</p>
                    <p className="text-sm">{orderData.customer.email}</p>
                    <p className="text-sm">{orderData.customer.phone}</p>
                  </div>
                  <div className="pt-2 border-t border-white/20 dark:border-slate-600/30">
                    <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">Delivery Address</p>
                    <p className="text-sm">{orderData.customer.address}</p>
                  </div>
                </div>
              </GlassCard>

              {/* Help Section */}
              <GlassCard className="p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Need Help?</h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-300 text-sm">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Call us: (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email: support@esenapharmacy.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Live chat available 24/7</span>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;