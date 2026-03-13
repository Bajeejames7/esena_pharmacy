import React, { useState, useEffect } from 'react';
import { useBreakpoint } from '../utils/responsive';
import { productsAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import DataTable from '../components/DataTable';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import GlassTextarea from '../components/forms/GlassTextarea';
import ThemeToggle from '../components/ThemeToggle';
import { validateField } from '../utils/validation';

/**
 * Admin products management page
 * Implements Requirements 25.8, 12.1, 12.2, 12.3, 12.4, 12.10, 12.11, 12.12
 */
const ManageProducts = () => {
  const { breakpoint } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(breakpoint !== 'mobile');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const shouldShowMenuButton = isMobile || isTablet;
  const itemsPerPage = 20;

  // Product form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: '',
    image: null,
    video: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Medication', label: 'Medication' },
    { value: 'Supplement', label: 'Supplement' },
    { value: 'Personal Care', label: 'Personal Care' },
    { value: 'Medical Supplies', label: 'Medical Supplies' },
    { value: 'Vitamins', label: 'Vitamins' }
  ];

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, categoryFilter]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await productsAPI.getAll();
      const allProducts = response.data || [];
      
      // Apply client-side filtering for now (can be moved to backend later)
      let filteredProducts = allProducts;
      
      if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => 
          product.category === categoryFilter
        );
      }
      
      if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Apply pagination
      const itemsPerPage = 10;
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      setProducts(paginatedProducts);
      setTotalItems(filteredProducts.length);
      setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    } catch (err) {
      setError('Failed to load products. Please try again.');
      console.error('Load products error:', err);
    } finally {
      setLoading(false);
    }
  };



  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (value) => `#${value}`
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100">{value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{row.category}</p>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (value) => `$${parseFloat(value).toFixed(2)}`
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value > 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
          value > 10 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
          value > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
          'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
        }`}>
          {value} units
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'Edit',
      variant: 'secondary',
      onClick: (product) => handleEditProduct(product)
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (product) => setDeleteConfirm(product)
    }
  ];

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      description: product.description,
      image: null,
      video: null
    });
    setFormErrors({});
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productsAPI.delete(productId);
      
      setDeleteConfirm(null);
      
      // Reload if current page becomes empty
      if (products.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadProducts();
      }
    } catch (error) {
      console.error('Delete product error:', error);
      setError('Failed to delete product. Please try again.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files) {
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear field error
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFormBlur = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? null : validation.error
    }));
  };

  const validateProductForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      errors.price = 'Valid price is required';
    }
    
    if (!formData.stock || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      errors.stock = 'Valid stock quantity is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProductForm()) {
      return;
    }
    
    setFormLoading(true);
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };
      
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        console.log('Updated product:', editingProduct.id, productData);
      } else {
        await productsAPI.create(productData);
        console.log('Created product:', productData);
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: '',
        image: null,
        video: null
      });
      
      loadProducts();
    } catch (error) {
      console.error('Save product error:', error);
      setFormErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (e) => {
    setCategoryFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader 
        onMenuToggle={() => setSidebarOpen(true)}
        showMenuButton={shouldShowMenuButton}
      />
      
      <div className="flex flex-1">
        <AdminSidebar 
          isOpen={sidebarOpen} 
          onToggle={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <div className={`flex-1 transition-all duration-300 ${
          !shouldShowMenuButton && sidebarOpen ? 'ml-64' : !shouldShowMenuButton ? 'ml-16' : ''
        }`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                {/* Remove mobile menu button since it's now in AdminHeader */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 lg:block hidden">Manage Products</h1>
                  <p className="text-gray-600 dark:text-gray-300">Add, edit, and manage your product inventory</p>
                </div>
              </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden lg:block">
                <ThemeToggle showLabel={true} />
              </div>
              
              <GlassButton
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    category: '',
                    price: '',
                    stock: '',
                    description: '',
                    image: null,
                    video: null
                  });
                  setFormErrors({});
                  setShowProductForm(true);
                }}
              >
                Add Product
              </GlassButton>
            </div>
          </div>

          {/* Search and Filters */}
          <GlassCard className="p-6 mb-6">
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
              <div className="md:col-span-2">
                <GlassInput
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <GlassSelect
                options={categories}
                value={categoryFilter}
                onChange={handleCategoryFilter}
              />
            </div>
          </GlassCard>

          {/* Products Table */}
          <DataTable
            data={products}
            columns={columns}
            loading={loading}
            error={error}
            actions={actions}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            emptyMessage="No products found. Add your first product to get started."
          />
          </div>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => setShowProductForm(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassInput
                    label="Product Name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    onBlur={handleFormBlur}
                    error={formErrors.name}
                    required
                    placeholder="Enter product name"
                  />
                  
                  <GlassSelect
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    options={categories.slice(1)} // Remove "All Categories" option
                    error={formErrors.category}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassInput
                    label="Price ($)"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleFormChange}
                    onBlur={handleFormBlur}
                    error={formErrors.price}
                    required
                    placeholder="0.00"
                  />
                  
                  <GlassInput
                    label="Stock Quantity"
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleFormChange}
                    onBlur={handleFormBlur}
                    error={formErrors.stock}
                    required
                    placeholder="0"
                  />
                </div>

                <GlassTextarea
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  onBlur={handleFormBlur}
                  error={formErrors.description}
                  required
                  rows={4}
                  maxLength={500}
                  placeholder="Describe the product..."
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFormChange}
                      className="glass-input w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG, WebP)</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Video (Optional)
                    </label>
                    <input
                      type="file"
                      name="video"
                      accept="video/mp4,video/webm"
                      onChange={handleFormChange}
                      className="glass-input w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max 50MB (MP4, WebM)</p>
                  </div>
                </div>

                {formErrors.submit && (
                  <div className="p-4 bg-red-100/50 border border-red-200 rounded-lg text-red-700">
                    {formErrors.submit}
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <GlassButton
                    type="submit"
                    loading={formLoading}
                    disabled={formLoading}
                    className="flex-1"
                  >
                    {formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </GlassButton>
                  
                  <GlassButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowProductForm(false)}
                    disabled={formLoading}
                  >
                    Cancel
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Delete Product</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Are you sure you want to delete "{deleteConfirm.name}"? This action cannot be undone.
              </p>
              
              <div className="flex space-x-4">
                <GlassButton
                  variant="danger"
                  onClick={() => handleDeleteProduct(deleteConfirm.id)}
                  className="flex-1"
                >
                  Delete
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;