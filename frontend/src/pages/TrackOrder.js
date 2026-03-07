import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

/**
 * Track Order page
 * Implements Requirements 6.1, 6.5, 6.6, 6.7
 */
const TrackOrder = () => {
  const { token } = useParams();
  const [trackingToken, setTrackingToken] = useState(token || '');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackOrder = async (e) => {
    e.preventDefault();
    if (!trackingToken.trim()) {
      setError('Please enter a tracking token');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // TODO: Implement API call to track order
      console.log('Tracking order:', trackingToken);
      
      // Placeholder response
      setTimeout(() => {
        setOrderData({
          id: '12345',
          token: trackingToken,
          status: 'processing',
          total: 89.99,
          items: [
            { name: 'Product 1', quantity: 2, price: 29.99 },
            { name: 'Product 2', quantity: 1, price: 30.01 }
          ],
          createdAt: '2024-03-01T10:00:00Z'
        });
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Order not found. Please check your tracking token.');
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'processing': return 'text-blue-600';
      case 'dispatched': return 'text-green-600';
      case 'delivered': return 'text-green-800';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <GlassCard className="p-8 mb-8">
          <h1 className="text-gray-800 mb-6 text-center">Track Your Order</h1>
          
          <form onSubmit={handleTrackOrder} className="max-w-md mx-auto">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tracking Token
              </label>
              <input
                type="text"
                value={trackingToken}
                onChange={(e) => setTrackingToken(e.target.value)}
                className="glass-input w-full"
                placeholder="Enter your tracking token"
                required
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100/50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="glass-button-primary w-full"
            >
              {loading ? 'Tracking...' : 'Track Order'}
            </button>
          </form>
        </GlassCard>

        {orderData && (
          <GlassCard className="p-8">
            <h2 className="text-gray-800 mb-6">Order Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Order Information</h3>
                <p className="text-gray-600">Order ID: #{orderData.id}</p>
                <p className="text-gray-600">Token: {orderData.token}</p>
                <p className="text-gray-600">
                  Date: {new Date(orderData.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">Status</h3>
                <p className={`font-semibold capitalize ${getStatusColor(orderData.status)}`}>
                  {orderData.status}
                </p>
                <p className="text-gray-600">Total: ${orderData.total.toFixed(2)}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;