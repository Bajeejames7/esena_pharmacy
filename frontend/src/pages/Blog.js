import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import GlassCard from '../components/GlassCard';

/**
 * Blog page with real data from database
 */
const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getPublished();
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const resolveImage = (src) => {
    if (!src) return src;
    if (src.startsWith('/uploads/')) {
      const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
      return base + '/api' + src;
    }
    return src;
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-glass-blue"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Health & Wellness Blog</h1>
            <p className="text-red-600">{error}</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <GlassCard className="p-8 text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">Health & Wellness Blog</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Stay informed with the latest health tips, medication guides, and wellness advice from our pharmacy experts.
          </p>
        </GlassCard>
        
        {blogs.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">No blog posts available at the moment. Check back soon!</p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <GlassCard key={blog.id} className="p-6" hover>
                {blog.image && (
                  <div className="aspect-video bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={resolveImage(blog.image)} 
                      alt={blog.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-500">Blog Image</div>';
                      }}
                    />
                  </div>
                )}
                
                {!blog.image && (
                  <div className="aspect-video bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500">📝</span>
                  </div>
                )}
                
                <div className="mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(blog.created_at)} • By {blog.author}
                  </span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-2">
                  {blog.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
                  {blog.excerpt ? truncateText(blog.excerpt) : truncateText(blog.content.replace(/<[^>]*>/g, ''))}
                </p>
                
                <Link 
                  to={`/blog/${blog.slug}`}
                  className="glass-button-secondary inline-block"
                >
                  Read More
                </Link>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;