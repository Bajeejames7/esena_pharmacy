import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

/**
 * Admin orders management page placeholder
 */
const ManageOrders = () => {
  const orders = [
    { id: '12345', customer: 'John Doe', total: 89.99, status: 'pending', date: '2024-03-07' },
    { id: '12346', customer: 'Jane Smith', total: 45.50, status: 'processing', date: '2024-03-06' },
    { id: '12347', customer: 'Bob Johnson', total: 120.00, status: 'dispatched', date: '2024-03-05' }
  ];

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
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Orders</h1>
          <Link to="/admin/dashboard" className="glass-button-secondary">
            Back to Dashboard
          </Link>
        </div>

        <GlassCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-800">Order ID</th>
                  <th className="text-left py-3 px-4 text-gray-800">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-800">Total</th>
                  <th className="text-left py-3 px-4 text-gray-800">Status</th>
                  <th className="text-left py-3 px-4 text-gray-800">Date</th>
                  <th className="text-left py-3 px-4 text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-white/10">
                    <td className="py-3 px-4 text-gray-800 font-medium">#{order.id}</td>
                    <td className="py-3 px-4 text-gray-600">{order.customer}</td>
                    <td className="py-3 px-4 text-gray-600">${order.total}</td>
                    <td className="py-3 px-4">
                      <span className={`capitalize font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{order.date}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">View</button>
                        <button className="text-green-600 hover:text-green-800">Update</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ManageOrders;