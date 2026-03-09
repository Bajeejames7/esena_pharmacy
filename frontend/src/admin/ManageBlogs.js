import React, { useState, useEffect } from 'react';
import { blogsAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import DataTable from '../components/DataTable';
import GlassButton from '../components/forms/GlassButton';
import GlassInput from '../components/forms/GlassInput';
import GlassTextarea from '../components/forms/GlassTextarea';
import GlassSelect from '../components/forms/GlassSelect';

const ManageBlogs = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingBlog) {
        await blogsAPI.update(editingBlog.id, formData);
      } else {
        await blogsAPI.create(formData);
      }
      
      await fetchBlogs();
      resetForm();
    } catch (error) {
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
      render: (blog) => (
        <div>
          <div className="font-medium text-gray-800">{blog.title}</div>
          <div className="text-sm text-gray-500">{blog.slug}</div>
        </div>
      )
    },
    {
      key: 'author',
      label: 'Author',
      render: (blog) => blog.author
    },
    {
      key: 'status',
      label: 'Status',
      render: (blog) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          blog.status === 'published' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {blog.status}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (blog) => formatDate(blog.created_at)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (blog) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(blog)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleToggleStatus(blog.id)}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            {blog.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={() => handleDelete(blog.id)}
            className="text-red-600 hover:text-red-800 text-sm"
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manage Blogs</h1>
        <GlassButton
          onClick={() => setShowForm(true)}
          className="bg-glass-blue text-white"
        >
          Add New Blog
        </GlassButton>
      </div>

      {showForm && (
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
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
                <GlassInput
                  label="Featured Image URL"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-glass-blue/50 focus:border-transparent resize-vertical"
                rows={12}
                placeholder="Write your blog content here... You can use HTML tags for formatting."
                required
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content}</p>
              )}
            </div>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
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
              >
                {editingBlog ? 'Update Blog' : 'Create Blog'}
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">All Blog Posts</h2>
        <DataTable
          data={blogs}
          columns={columns}
          emptyMessage="No blog posts found"
        />
      </GlassCard>
    </div>
  );
};

export default ManageBlogs;