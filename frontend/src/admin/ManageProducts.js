import React from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

/**
 * Admin products management page placeholder
 */
const ManageProducts = () => {
  const products = [
    { id: 1, name: 'Product 1', category: 'Medication', price: 29.99, stock: 50 },
    { id: 2, name: 'Product 2', category: 'Supplement', price: 19.99, stock: 25 },
    { id: 3, name: 'Product 3', category: 'Personal Care', price: 15.99, stock: 100 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white">
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Manage Products</h1>
          <div className="flex gap-4">
            <button className="glass-button-primary">Add Product</button>
            <Link to="/admin/dashboard" className="glass-button-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        <GlassCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-gray-800">ID</th>
                  <th className="text-left py-3 px-4 text-gray-800">Name</th>
                  <th className="text-left py-3 px-4 text-gray-800">Category</th>
                  <th className="text-left py-3 px-4 text-gray-800">Price</th>
                  <th className="text-left py-3 px-4 text-gray-800">Stock</th>
                  <th className="text-left py-3 px-4 text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-white/10">
                    <td className="py-3 px-4 text-gray-600">{product.id}</td>
                    <td className="py-3 px-4 text-gray-800 font-medium">{product.name}</td>
                    <td className="py-3 px-4 text-gray-600">{product.category}</td>
                    <td className="py-3 px-4 text-gray-600">${product.price}</td>
                    <td className="py-3 px-4 text-gray-600">{product.stock}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800">Edit</button>
                        <button className="text-red-600 hover:text-red-800">Delete</button>
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

export default ManageProducts;