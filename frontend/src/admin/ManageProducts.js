import React, { useState, useEffect } from 'react';
import { useBreakpoint } from '../utils/responsive';
import { productsAPI } from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import GlassTextarea from '../components/forms/GlassTextarea';
import ThemeToggle from '../components/ThemeToggle';
import { validateField } from '../utils/validation';
import { CATEGORIES } from '../utils/categories';

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
  const [expandedProduct, setExpandedProduct] = useState(null);

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

  // Build category options from shared list — includes "All" for filter dropdown
  const categoryFilterOptions = [
    { value: '', label: 'All Categories' },
    ...CATEGORIES.map(c => ({ value: c.value, label: c.label }))
  ];
  // Form dropdown — no "All" option
  const categoryFormOptions = CATEGORIES.map(c => ({ value: c.value, label: c.label }));

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
      const allProducts = Array.isArray(response.data) ? response.data : (response.data?.products || []);
      const totalCount = response.data?.total ?? allProducts.length;
      
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
      setTotalItems(totalCount);
      setTotalPages(Math.ceil(totalCount / itemsPerPage));
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
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : '—'
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
      // Use FormData so image/video files are sent as multipart/form-data
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('price', parseFloat(formData.price));
      data.append('stock', parseInt(formData.stock));
      data.append('description', formData.description || '');
      if (formData.image) data.append('image', formData.image);
      if (formData.video) data.append('video', formData.video);
      
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, data);
      } else {
        await productsAPI.create(data);
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

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const getImageUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    return `${API_BASE}/uploads/products/${filename}`;
  };

  const getVideoUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith('http')) return filename;
    return `${API_BASE}/uploads/videos/${filename}`;
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
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Products</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Add, edit, and manage your product inventory</p>
              </div>
              <div className="flex items-center gap-2">
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
          <GlassCard className="p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <GlassInput
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <GlassSelect
                options={categoryFilterOptions}
                value={categoryFilter}
                onChange={handleCategoryFilter}
              />
            </div>
          </GlassCard>

          {/* Products List */}
          {loading ? (
            <GlassCard className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading products...</p>
            </GlassCard>
          ) : error ? (
            <GlassCard className="p-8 text-center">
              <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
              <GlassButton onClick={loadProducts}>Retry</GlassButton>
            </GlassCard>
          ) : products.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <p className="text-gray-600 dark:text-gray-300">No products found. Add your first product to get started.</p>
            </GlassCard>
          ) : (
            <div className="space-y-2">
              {products.map((product) => {
                const isExpanded = expandedProduct === product.id;
                const imgUrl = getImageUrl(product.image);
                const vidUrl = getVideoUrl(product.video);
                return (
                  <GlassCard key={product.id} className="overflow-hidden">
                    {/* Collapsed row — always visible */}
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-glass-blue/20 to-glass-green/20 flex-shrink-0 flex items-center justify-center">
                        {imgUrl ? (
                          <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>

                      {/* Name + category */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">
                        KSh {parseFloat(product.price).toFixed(2)}
                      </span>

                      {/* Stock badge */}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium hidden sm:block ${
                        product.stock > 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                        product.stock > 10 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                        product.stock > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                      }`}>
                        {product.stock} units
                      </span>

                      {/* Media indicators */}
                      <div className="flex gap-1">
                        {imgUrl && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">IMG</span>}
                        {vidUrl && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">VID</span>}
                      </div>

                      {/* Chevron */}
                      <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="border-t border-white/20 dark:border-slate-600/30 p-4 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Image preview */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Image</p>
                            {imgUrl ? (
                              <img src={imgUrl} alt={product.name} className="w-full max-h-48 object-contain rounded-lg bg-gray-50 dark:bg-slate-800" />
                            ) : (
                              <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 text-sm">No image</div>
                            )}
                          </div>

                          {/* Video preview */}
                          <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Video</p>
                            {vidUrl ? (
                              <video src={vidUrl} controls className="w-full max-h-48 rounded-lg bg-black" />
                            ) : (
                              <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 text-sm">No video</div>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div><span className="text-gray-500 dark:text-gray-400">ID:</span> <span className="text-gray-800 dark:text-gray-100">#{product.id}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Price:</span> <span className="text-gray-800 dark:text-gray-100">KSh {parseFloat(product.price).toFixed(2)}</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Stock:</span> <span className="text-gray-800 dark:text-gray-100">{product.stock} units</span></div>
                          <div><span className="text-gray-500 dark:text-gray-400">Added:</span> <span className="text-gray-800 dark:text-gray-100">{product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}</span></div>
                        </div>

                        {product.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">{product.description}</p>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <GlassButton variant="secondary" onClick={() => handleEditProduct(product)}>Edit</GlassButton>
                          <GlassButton variant="danger" onClick={() => setDeleteConfirm(product)}>Delete</GlassButton>
                        </div>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <GlassButton variant="secondary" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Prev</GlassButton>
              <span className="text-sm text-gray-600 dark:text-gray-300">Page {currentPage} of {totalPages}</span>
              <GlassButton variant="secondary" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</GlassButton>
            </div>
          )}
          </div>
        </div>
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
                    options={categoryFormOptions}
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
  );
};

export default ManageProducts;