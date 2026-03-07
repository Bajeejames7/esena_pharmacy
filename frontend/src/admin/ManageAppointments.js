import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

/**
 * Admin appointments management page placeholder
 */
const ManageAppointments = () => {
  const appointments = [
    { id: '1', customer: 'Alice Brown', service: 'Dermatology', date: '2024-03-08', time: '10:00', status: 'pending' },
    { id: '2', customer: 'Charlie Wilson', service: 'Lab Test', date: '2024-03-09', time: '14:30', status: 'confirmed' },
    { id: '3', customer: 'Diana Davis', service: 'Pharmacist', date: '2024-03-10', time: '09:15', status: 'pending' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'confirmed': return 'text-green-600';
      case 'completed': return 'text-blue-600';
      case 'cancelled': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Appointments</h1>
          <Link to="/admin/dashboard" className="glass-button-secondary">
            Back to Dashboard
          </Link>
        </div>

        <GlassCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-800">ID</th>
                  <th className="text-left py-3 px-4 text-gray-800">Customer</th>
                  <th className="text-left py-3 px-4 text-gray-800">Service</th>
                  <th className="text-left py-3 px-4 text-gray-800">Date</th>
                  <th className="text-left py-3 px-4 text-gray-800">Time</th>
                  <th className="text-left py-3 px-4 text-gray-800">Status</th>
                  <th className="text-left py-3 px-4 text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="border-b border-white/10">
                    <td className="py-3 px-4 text-gray-600">{appointment.id}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{appointment.customer}</td>
                    <td className="py-3 px-4 text-gray-600">{appointment.service}</td>
                    <td className="py-3 px-4 text-gray-600">{appointment.date}</td>
                    <td className="py-3 px-4 text-gray-600">{appointment.time}</td>
                    <td className="py-3 px-4">
                      <span className={`capitalize font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">View</button>
                        <button className="text-green-600 hover:text-green-800">Confirm</button>
                        <button className="text-red-600 hover:text-red-800">Cancel</button>
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

export default ManageAppointments;