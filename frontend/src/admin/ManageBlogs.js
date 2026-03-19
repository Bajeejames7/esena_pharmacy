import React, { useState, useEffect } from 'react';
import { useBreakpoint } from '../utils/responsive';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import { blogsAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import DataTable from '../components/DataTable';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassTextarea from '../components/forms/GlassTextarea';
import GlassSelect from '../components/forms/GlassSelect';
import ThemeToggle from '../components/ThemeToggle';

const ManageBlogs = () => {
  const { breakpoint } = useBreakpoint();
  const [sidebarOpen, setSidebarOpen] = useState(breakpoint !== 'mobile');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    author: 'Esena Pharmacy',
    status: 'draft'
  });
  const [errors, setErrors] = useState({});
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const shouldShowMenuButton = isMobile || isTablet;

  useEffect(() => {
    // Auto-collapse sidebar on mobile
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getAll();
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      let imageUrl = formData.image;

      // Upload file first if one was selected
      if (imageMode === 'upload' && imageFile) {
        setUploadingImage(true);
        const res = await blogsAPI.uploadImage(imageFile);
        imageUrl = res.data.imageUrl;
        setUploadingImage(false);
      }

      const payload = { ...formData, image: imageUrl };

      if (editingBlog) {
        await blogsAPI.update(editingBlog.id, payload);
      } else {
        await blogsAPI.create(payload);
      }

      await fetchBlogs();
      resetForm();
    } catch (error) {
      setUploadingImage(false);
      console.error('Error saving blog:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to save blog' });
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content,
      image: blog.image || '',
      author: blog.author,
      status: blog.status
    });
    setImageMode('url');
    setImageFile(null);
    setImagePreview(blog.image || '');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await blogsAPI.delete(id);
        await fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await blogsAPI.toggleStatus(id);
      await fetchBlogs();
    } catch (error) {
      console.error('Error toggling blog status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      image: '',
      author: 'Esena Pharmacy',
      status: 'draft'
    });
    setEditingBlog(null);
    setShowForm(false);
    setErrors({});
    setImageMode('url');
    setImageFile(null);
    setImagePreview('');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-gray-100">{value}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.slug}</div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (value) => value
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'published' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (value) => formatDate(value)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleStatus(row.id)}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 text-sm"
          >
            {row.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glass-blue"></div>
      </div>
    );
  }

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
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 lg:block hidden">Manage Blogs</h1>
                  <p className="text-gray-600 dark:text-gray-300">Create and manage blog posts for your pharmacy.</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="hidden lg:block">
                  <ThemeToggle showLabel={true} />
                </div>
                
                <GlassButton
                  onClick={() => setShowForm(true)}
                  className="bg-glass-blue text-white"
                >
                  Add New Blog
                </GlassButton>
              </div>
            </div>

    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Blog Posts</h2>
      </div>

      {showForm && (
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <GlassInput
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={errors.title}
                  required
                />
              </div>
              <div>
                <GlassSelect
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'published', label: 'Published' }
                  ]}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <GlassInput
                  label="Author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Featured Image</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => { setImageMode('url'); setImageFile(null); setImagePreview(formData.image); }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${imageMode === 'url' ? 'bg-glass-blue text-white' : 'bg-white/30 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300'}`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => { setImageMode('upload'); }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${imageMode === 'upload' ? 'bg-glass-blue text-white' : 'bg-white/30 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300'}`}
                  >
                    Upload
                  </button>
                </div>
                {imageMode === 'url' ? (
                  <GlassInput
                    value={formData.image}
                    onChange={(e) => { setFormData({ ...formData, image: e.target.value }); setImagePreview(e.target.value); }}
                    placeholder="https://example.com/image.jpg"
                  />
                ) : (
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageFileChange}
                    className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:bg-glass-blue/20 file:text-glass-blue dark:file:text-blue-300 hover:file:bg-glass-blue/30 cursor-pointer"
                  />
                )}
                {(imagePreview || formData.image) && (
                  <img
                    src={(() => {
                      const src = imagePreview || formData.image;
                      if (src && src.startsWith('/uploads/')) {
                        return (process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + src;
                      }
                      return src;
                    })()}
                    alt="Preview"
                    className="mt-2 h-24 w-full object-cover rounded-lg border border-white/20"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>

            <div>
              <GlassTextarea
                label="Excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description of the blog post..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-glass-blue/50 focus:border-transparent resize-vertical text-gray-900 dark:text-gray-100"
                rows={12}
                placeholder="Write your blog content here... You can use HTML tags for formatting."
                required
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <GlassButton
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                className="bg-glass-blue text-white"
                disabled={uploadingImage}
              >
                {uploadingImage ? 'Uploading image...' : editingBlog ? 'Update Blog' : 'Create Blog'}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">All Blog Posts</h2>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <GlassInput
              placeholder="Search by title or author..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-44">
            <GlassSelect
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
              ]}
            />
          </div>
        </div>
        <DataTable
          data={blogs.filter(b => {
            const term = searchTerm.toLowerCase();
            const matchesSearch = !term ||
              (b.title || '').toLowerCase().includes(term) ||
              (b.author || '').toLowerCase().includes(term);
            const matchesStatus = !statusFilter || b.status === statusFilter;
            return matchesSearch && matchesStatus;
          })}
          columns={columns}
          emptyMessage="No blog posts found"
        />
      </GlassCard>
    </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBlogs;