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

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelled, setCancelled] = useState(false);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    setCancelError('');
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/orders/cancel/${orderData.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by customer' })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to cancel order');
      }
      setOrderData(prev => ({ ...prev, status: 'cancelled' }));
      setCancelled(true);
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  // Auto-track if token is provided in URL
  useEffect(() => {
    if (token) {
      handleTrackOrder();
    }
  }, [token]);

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
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/orders/${tokenToTrack}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found');
        }
        throw new Error('Failed to fetch order');
      }
      
      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      setError('Order not found. Please check your tracking token and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⏳', message: 'Your order has been received and is awaiting payment.' };
      case 'payment_requested':
        return { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: '💳', message: 'Payment has been requested. Please complete your payment.' };
      case 'paid':
        return { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: '📦', message: 'Payment confirmed. Your order is being prepared.' };
      case 'dispatched':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: '🚚', message: 'Your order has been dispatched and is on its way.' };
      case 'completed':
        return { color: 'text-green-800', bgColor: 'bg-green-200', icon: '✅', message: 'Your order has been delivered successfully.' };
      case 'cancelled':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: '❌', message: 'This order has been cancelled.' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '❓', message: 'Order status unknown.' };
    }
  };

  const getStatusTimeline = (currentStatus) => {
    const allStatuses = [
      { key: 'pending', label: 'Order Placed', description: 'Order received and confirmed' },
      { key: 'payment_requested', label: 'Payment Requested', description: 'Awaiting payment' },
      { key: 'paid', label: 'Paid', description: 'Payment confirmed, preparing order' },
      { key: 'dispatched', label: 'Dispatched', description: 'Order shipped and in transit' },
      { key: 'completed', label: 'Completed', description: 'Order delivered successfully' }
    ];

    if (currentStatus === 'cancelled') {
      // Find the last completed step before cancellation by checking which statuses
      // could have been reached — we don't know exactly, so show pending as done + cancelled
      // Use the order's actual last known status if available, otherwise just show pending + cancelled
      const cancelledStep = { key: 'cancelled', label: 'Cancelled', description: 'Order was cancelled', isCancelled: true };
      // Show pending as completed (it always was), then cancelled
      return [
        { ...allStatuses[0], completed: true, active: false },
        { ...cancelledStep, completed: true, active: true }
      ];
    }

    const currentIndex = allStatuses.findIndex(s => s.key === currentStatus);
    return allStatuses.map((status, index) => ({
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

            <div className="mt-6 p-4 bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg flex items-start space-x-3">
              <span className="text-amber-500 text-lg mt-0.5">🔒</span>
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200 text-sm">Keep your tracking token private</p>
                <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                  Your tracking token gives access to your order details including your name, phone number, and delivery address. Do not share it with anyone.
                </p>
              </div>
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
                  {['pending', 'payment_requested'].includes(orderData.status) && (
                    <GlassButton
                      variant="danger"
                      size="sm"
                      onClick={handleCancelOrder}
                      disabled={cancelling}
                    >
                      {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </GlassButton>
                  )}
                </div>
                {cancelError && <p className="text-red-600 text-sm mt-2">{cancelError}</p>}
                {cancelled && <p className="text-green-600 text-sm mt-2">Your order has been cancelled successfully.</p>}
                
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
                    <p className="font-mono text-xs text-gray-800 dark:text-white break-all">{orderData.token}</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">🔒 Keep this token private — do not share it with anyone.</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Order Date</p>
                    <p className="text-gray-800 dark:text-white">{new Date(orderData.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Payment Method</p>
                    <p className="text-gray-800 dark:text-white capitalize">{orderData.notes || 'N/A'}</p>                  </div>
                </div>

                {/* Status Timeline */}
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-800 dark:text-white">Order Timeline</h3>
                  <div className="space-y-3">
                    {getStatusTimeline(orderData.status).map((step, index) => (
                      <div key={step.key} className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          step.isCancelled
                            ? 'bg-red-500 text-white'
                            : step.completed 
                              ? 'bg-green-500 text-white' 
                              : step.active 
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.isCancelled ? '✕' : step.completed ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            step.isCancelled ? 'text-red-600 dark:text-red-400' :
                            step.completed || step.active ? 'text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          <p className={`text-sm ${
                            step.isCancelled ? 'text-red-500 dark:text-red-400' :
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
                {orderData.items && orderData.items.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between p-4 bg-white/10 dark:bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">{item.name}</p>
                          <p className="text-gray-600 dark:text-gray-300 text-sm">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800 dark:text-white">
                          KSH {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          KSH {parseFloat(item.price).toFixed(2)} each
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
                  <div className="border-t border-white/20 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="font-semibold text-gray-800">KSH {parseFloat(orderData.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </GlassCard>

              {/* Customer Information */}
              <GlassCard className="p-6">
                <h3 className="font-medium text-gray-800 dark:text-white mb-4">Delivery Information</h3>
                <div className="space-y-3 text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{orderData.customer_name}</p>
                    <p className="text-sm">{orderData.email}</p>
                    <p className="text-sm">{orderData.phone}</p>
                  </div>
                  <div className="pt-2 border-t border-white/20 dark:border-slate-600/30">
                    <p className="font-medium text-gray-700 dark:text-gray-200 mb-1">Delivery Address</p>
                    <p className="text-sm">{orderData.delivery_address}</p>
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
                    <span>Call us: 0768103599</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email: esenapharmacy@gmail.com</span>
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