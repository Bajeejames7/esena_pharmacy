import React, { useState, useEffect, useCallback } from 'react';
import { useBreakpoint } from '../utils/responsive';
import { productsAPI, inventoryAPI } from '../services/api';
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

const PERIOD_OPTIONS = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

const MOVEMENT_TYPE_OPTIONS = [
  { value: 'restock', label: 'Restock (add stock)' },
  { value: 'adjustment', label: 'Adjustment (add or remove)' },
  { value: 'damage', label: 'Damage / Loss (remove stock)' },
  { value: 'return', label: 'Customer Return (add stock)' },
];

const movementColor = (type) => {
  switch (type) {
    case 'restock': return 'text-green-600 dark:text-green-400';
    case 'return': return 'text-blue-600 dark:text-blue-400';
    case 'sale': return 'text-orange-600 dark:text-orange-400';
    case 'damage': return 'text-red-600 dark:text-red-400';
    case 'adjustment': return 'text-purple-600 dark:text-purple-400';
    default: return 'text-gray-600 dark:text-gray-400';
  }
};

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
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Inventory panel state
  const [inventoryProduct, setInventoryProduct] = useState(null);
  const [inventoryPeriod, setInventoryPeriod] = useState('month');
  const [movements, setMovements] = useState([]);
  const [movementStats, setMovementStats] = useState(null);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjustForm, setAdjustForm] = useState({ type: 'restock', quantity: '', note: '' });
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState(null);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const shouldShowMenuButton = isMobile || isTablet;

  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '', description: '', image: null, video: null });
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);

  const categoryFilterOptions = [
    { value: '', label: 'All Categories' },
    ...CATEGORIES
  ];
  const categoryFormOptions = CATEGORIES;

  const PER_PAGE = 10;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        limit: PER_PAGE,
        offset: (currentPage - 1) * PER_PAGE,
      };
      if (categoryFilter) params.category = categoryFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await productsAPI.getAll(params);
      const { products: items, total } = response.data;
      setProducts(items || []);
      setTotalPages(Math.max(1, Math.ceil(total / PER_PAGE)));
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.message || 'Unknown error';
      if (status === 429) {
        setError('Rate limit reached. Please wait a moment and retry.');
      } else if (status === 401 || status === 403) {
        setError(`Authentication error (${status}). Please log out and log back in.`);
      } else if (status >= 500) {
        setError(`Server error (${status}): ${msg}`);
      } else if (!err.response) {
        setError(`Network error — could not reach the server. (${msg})`);
      } else {
        setError(`Failed to load products (${status}): ${msg}`);
      }
      console.error('loadProducts error:', err.response || err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, categoryFilter]);

  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);
  useEffect(() => { loadProducts(); }, [loadProducts]);

  const loadMovements = useCallback(async (product, period) => {
    setMovementsLoading(true);
    try {
      const res = await inventoryAPI.getMovements(product.id, period);
      setMovements(res.data.movements || []);
      setMovementStats(res.data.stats || null);
      // Refresh current stock from response
      setInventoryProduct(prev => prev ? { ...prev, stock: res.data.product.stock } : prev);
      // Also update in product list
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: res.data.product.stock } : p));
    } catch {
      setMovements([]);
    } finally {
      setMovementsLoading(false);
    }
  }, []);

  const openInventory = (product) => {
    setInventoryProduct(product);
    setShowAdjustForm(false);
    setAdjustForm({ type: 'restock', quantity: '', note: '' });
    setAdjustError(null);
    loadMovements(product, inventoryPeriod);
  };

  const handlePeriodChange = (period) => {
    setInventoryPeriod(period);
    if (inventoryProduct) loadMovements(inventoryProduct, period);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustError(null);
    const qty = parseInt(adjustForm.quantity);
    if (!qty || qty === 0) { setAdjustError('Enter a non-zero quantity.'); return; }
    setAdjusting(true);
    try {
      await inventoryAPI.addMovement(inventoryProduct.id, {
        type: adjustForm.type,
        quantity: qty,
        note: adjustForm.note,
      });
      setShowAdjustForm(false);
      setAdjustForm({ type: 'restock', quantity: '', note: '' });
      await loadMovements(inventoryProduct, inventoryPeriod);
    } catch (err) {
      setAdjustError(err.response?.data?.message || 'Failed to record movement.');
    } finally {
      setAdjusting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({ name: product.name, category: product.category, price: product.price.toString(),
      stock: product.stock.toString(), description: product.description || '', image: null, video: null });
    setFormErrors({});
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await productsAPI.delete(productId);
      setDeleteConfirm(null);
      if (products.length === 1 && currentPage > 1) setCurrentPage(p => p - 1);
      else loadProducts();
    } catch {
      setError('Failed to delete product. Please try again.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({ ...prev, [name]: files ? files[0] : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleFormBlur = (e) => {
    const { name, value } = e.target;
    const v = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: v.isValid ? null : v.error }));
  };

  const validateProductForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.category) errors.category = 'Category is required';
    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) errors.price = 'Valid price is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateProductForm()) return;
    setFormLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('price', parseFloat(formData.price));
      data.append('description', formData.description || '');
      // When creating, stock is required for initial movement; when editing, stock field is hidden
      if (!editingProduct) {
        const initialStock = parseInt(formData.stock) || 0;
        data.append('stock', initialStock);
      } else {
        // Keep existing stock — changes go through inventory movements
        data.append('stock', editingProduct.stock);
      }
      if (formData.image) data.append('image', formData.image);
      if (formData.video) data.append('video', formData.video);

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, data);
      } else {
        const res = await productsAPI.create(data);
        // Seed initial stock movement if stock > 0
        const initialStock = parseInt(formData.stock) || 0;
        if (initialStock > 0 && res.data?.id) {
          try {
            await inventoryAPI.addMovement(res.data.id, {
              type: 'restock',
              quantity: initialStock,
              note: 'Initial stock on product creation',
            });
          } catch { /* non-fatal */ }
        }
      }

      setShowProductForm(false);
      setEditingProduct(null);
      setFormData({ name: '', category: '', price: '', stock: '', description: '', image: null, video: null });
      loadProducts();
    } catch {
      setFormErrors({ submit: 'Failed to save product. Please try again.' });
    } finally {
      setFormLoading(false);
    }
  };

  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const getImageUrl = (f) => !f ? null : f.startsWith('http') ? f : `${API_BASE}/uploads/products/${f}`;
  const getVideoUrl = (f) => !f ? null : f.startsWith('http') ? f : `${API_BASE}/uploads/videos/${f}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} showMenuButton={shouldShowMenuButton} />
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 min-w-0 overflow-x-hidden ${!shouldShowMenuButton && sidebarOpen ? 'ml-64' : !shouldShowMenuButton ? 'ml-16' : ''}`}>
          <div className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Manage Products</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Add, edit, and manage your product inventory</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden lg:block"><ThemeToggle showLabel={true} /></div>
                <GlassButton onClick={() => { setEditingProduct(null); setFormData({ name: '', category: '', price: '', stock: '', description: '', image: null, video: null }); setFormErrors({}); setShowProductForm(true); }}>
                  Add Product
                </GlassButton>
              </div>
            </div>

            <GlassCard className="p-4 mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <GlassInput placeholder="Search products..." value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
                <GlassSelect options={categoryFilterOptions} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }} />
              </div>
            </GlassCard>

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
                <p className="text-gray-600 dark:text-gray-300">No products found.</p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {products.map(product => {
                  const isExpanded = expandedProduct === product.id;
                  const imgUrl = getImageUrl(product.image);
                  const vidUrl = getVideoUrl(product.video);
                  return (
                    <GlassCard key={product.id} className="overflow-hidden">
                      <div className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setExpandedProduct(isExpanded ? null : product.id)}>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-glass-blue/20 to-glass-green/20 flex-shrink-0 flex items-center justify-center">                          {imgUrl ? <img src={imgUrl} alt={product.name} className="w-full h-full object-cover" /> : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.category}</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 hidden sm:block">KSh {parseFloat(product.price).toFixed(2)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium hidden sm:block ${product.stock > 50 ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : product.stock > 10 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' : product.stock > 0 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'}`}>
                          {product.stock} units
                        </span>
                        <div className="flex gap-1">
                          {imgUrl && <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">IMG</span>}
                          {vidUrl && <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">VID</span>}
                        </div>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-white/20 dark:border-slate-600/30 p-4 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Image</p>
                              {imgUrl ? <img src={imgUrl} alt={product.name} className="w-full max-h-48 object-contain rounded-lg bg-gray-50 dark:bg-slate-800" /> : <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 text-sm">No image</div>}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Video</p>
                              {vidUrl ? <video src={vidUrl} controls className="w-full max-h-48 rounded-lg bg-black" /> : <div className="w-full h-32 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 text-sm">No video</div>}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-gray-500 dark:text-gray-400">ID:</span> <span className="text-gray-800 dark:text-gray-100">#{product.id}</span></div>
                            <div><span className="text-gray-500 dark:text-gray-400">Price:</span> <span className="text-gray-800 dark:text-gray-100">KSh {parseFloat(product.price).toFixed(2)}</span></div>
                            <div><span className="text-gray-500 dark:text-gray-400">Stock:</span> <span className="text-gray-800 dark:text-gray-100">{product.stock} units</span></div>
                            <div><span className="text-gray-500 dark:text-gray-400">Added:</span> <span className="text-gray-800 dark:text-gray-100">{product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}</span></div>
                          </div>
                          {product.description && <p className="text-sm text-gray-600 dark:text-gray-300">{product.description}</p>}
                          <div className="flex gap-3 pt-2">
                            <GlassButton variant="secondary" onClick={() => handleEditProduct(product)}>Edit</GlassButton>
                            <GlassButton onClick={() => openInventory(product)}>Inventory</GlassButton>
                            <GlassButton variant="danger" onClick={() => setDeleteConfirm(product)}>Delete</GlassButton>
                          </div>
                        </div>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            )}

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

      {/* ── Inventory Panel Modal ── */}
      {inventoryProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-3xl my-8">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Inventory — {inventoryProduct.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current stock: <span className="font-semibold text-gray-800 dark:text-gray-100">{inventoryProduct.stock} units</span></p>
                </div>
                <button onClick={() => setInventoryProduct(null)} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Close">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Period filter + Adjust button */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex gap-2">
                  {PERIOD_OPTIONS.map(opt => (
                    <button key={opt.value}
                      onClick={() => handlePeriodChange(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${inventoryPeriod === opt.value ? 'bg-glass-blue text-white' : 'bg-white/20 dark:bg-slate-700/40 text-gray-700 dark:text-gray-300 hover:bg-white/30'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                <GlassButton size="sm" onClick={() => { setShowAdjustForm(true); setAdjustError(null); }}>
                  + Adjust Stock
                </GlassButton>
              </div>

              {/* Stats row */}
              {movementStats && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Stock In</p>
                    <p className="text-lg font-bold text-green-700 dark:text-green-400">+{movementStats.total_in}</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Stock Out</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-400">-{movementStats.total_out}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Movements</p>
                    <p className="text-lg font-bold text-blue-700 dark:text-blue-400">{movementStats.movement_count}</p>
                  </div>
                </div>
              )}

              {/* Adjust Stock Form */}
              {showAdjustForm && (
                <div className="bg-white/10 dark:bg-slate-700/30 rounded-lg p-4 mb-4">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Record Stock Movement</h3>
                  <form onSubmit={handleAdjustSubmit} className="space-y-3">
                    <GlassSelect
                      label="Movement Type"
                      options={MOVEMENT_TYPE_OPTIONS}
                      value={adjustForm.type}
                      onChange={e => setAdjustForm(f => ({ ...f, type: e.target.value }))}
                    />
                    <GlassInput
                      label={adjustForm.type === 'damage' ? 'Units Lost' : adjustForm.type === 'adjustment' ? 'Units (positive = add, negative = remove)' : 'Units'}
                      type="number"
                      value={adjustForm.quantity}
                      onChange={e => setAdjustForm(f => ({ ...f, quantity: e.target.value }))}
                      placeholder={adjustForm.type === 'adjustment' ? 'e.g. -5 or +10' : 'e.g. 50'}
                      required
                    />
                    <GlassInput
                      label="Note (optional)"
                      value={adjustForm.note}
                      onChange={e => setAdjustForm(f => ({ ...f, note: e.target.value }))}
                      placeholder="e.g. Received from supplier, damaged in storage..."
                    />
                    {adjustError && <p className="text-sm text-red-600 dark:text-red-400">{adjustError}</p>}
                    <div className="flex gap-2">
                      <GlassButton type="submit" disabled={adjusting}>{adjusting ? 'Saving...' : 'Save Movement'}</GlassButton>
                      <GlassButton type="button" variant="secondary" onClick={() => setShowAdjustForm(false)}>Cancel</GlassButton>
                    </div>
                  </form>
                </div>
              )}

              {/* Movements list */}
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {movementsLoading ? (
                  <div className="text-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
                ) : movements.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">No movements recorded for this period.</p>
                ) : movements.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 bg-white/10 dark:bg-slate-700/20 rounded-lg text-sm">
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-base ${m.quantity > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {m.quantity > 0 ? '+' : ''}{m.quantity}
                      </span>
                      <div>
                        <span className={`font-medium capitalize ${movementColor(m.type)}`}>{m.type}</span>
                        {m.note && <p className="text-xs text-gray-500 dark:text-gray-400">{m.note}</p>}
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      <p>{m.performed_by_name || m.user_name || '—'}</p>
                      <p>{new Date(m.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ── Product Form Modal ── */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <GlassCard className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setShowProductForm(false)} className="p-2 rounded-lg hover:bg-white/20 transition-colors" aria-label="Close">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassInput label="Product Name" name="name" value={formData.name} onChange={handleFormChange} onBlur={handleFormBlur} error={formErrors.name} required placeholder="Enter product name" />
                  <GlassSelect label="Category" name="category" value={formData.category} onChange={handleFormChange} options={categoryFormOptions} error={formErrors.category} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassInput label="Price (KSH)" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleFormChange} onBlur={handleFormBlur} error={formErrors.price} required placeholder="0.00" />
                  {!editingProduct && (
                    <div>
                      <GlassInput label="Initial Stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleFormChange} error={formErrors.stock} placeholder="0" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Opening stock — future changes go through Inventory.</p>
                    </div>
                  )}
                  {editingProduct && (
                    <div className="flex items-end pb-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Stock: <span className="font-semibold text-gray-800 dark:text-gray-100">{editingProduct.stock} units</span> — use the Inventory button to adjust.</p>
                    </div>
                  )}
                </div>
                <GlassTextarea label="Description" name="description" value={formData.description} onChange={handleFormChange} onBlur={handleFormBlur} error={formErrors.description} required rows={4} maxLength={500} placeholder="Describe the product..." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Image</label>
                    <input type="file" name="image" accept="image/jpeg,image/png,image/webp" onChange={handleFormChange} className="glass-input w-full" />
                    <p className="text-xs text-gray-500 mt-1">Max 5MB (JPG, PNG, WebP)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Video (Optional)</label>
                    <input type="file" name="video" accept="video/mp4,video/webm" onChange={handleFormChange} className="glass-input w-full" />
                    <p className="text-xs text-gray-500 mt-1">Max 50MB (MP4, WebM)</p>
                  </div>
                </div>
                {formErrors.submit && <div className="p-4 bg-red-100/50 border border-red-200 rounded-lg text-red-700">{formErrors.submit}</div>}
                <div className="flex space-x-4 pt-4">
                  <GlassButton type="submit" loading={formLoading} disabled={formLoading} className="flex-1">{formLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}</GlassButton>
                  <GlassButton type="button" variant="secondary" onClick={() => setShowProductForm(false)} disabled={formLoading}>Cancel</GlassButton>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <GlassCard className="p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Delete Product</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete "{deleteConfirm.name}"? This cannot be undone.</p>
              <div className="flex space-x-4">
                <GlassButton variant="danger" onClick={() => handleDeleteProduct(deleteConfirm.id)} className="flex-1">Delete</GlassButton>
                <GlassButton variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">Cancel</GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
