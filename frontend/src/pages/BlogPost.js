import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { blogsAPI } from '../services/api';
import GlassCard from '../components/GlassCard';

/**
 * Individual blog post page
 */
const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogsAPI.getBySlug(slug);
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      if (error.response?.status === 404) {
        setError('Blog post not found');
      } else {
        setError('Failed to load blog post');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  if (loading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
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
        <div className="max-w-4xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Oops!</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <Link 
              to="/blog"
              className="glass-button-primary"
            >
              Back to Blog
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back to blog button */}
        <div className="mb-6">
          <Link 
            to="/blog"
            className="inline-flex items-center text-glass-blue hover:text-glass-blue/80 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>

        <GlassCard className="p-8">
          {/* Featured image */}
          {blog.image && (
            <div className="aspect-video bg-gradient-to-br from-glass-blue/20 to-glass-green/20 rounded-lg mb-8 overflow-hidden">
              <img 
                src={resolveImage(blog.image)} 
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Blog header */}
          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center text-sm text-gray-600 dark:text-gray-400 space-x-4">
              <span>By {blog.author}</span>
              <span>•</span>
              <span>{formatDate(blog.created_at)}</span>
              {blog.updated_at !== blog.created_at && (
                <>
                  <span>•</span>
                  <span>Updated {formatDate(blog.updated_at)}</span>
                </>
              )}
            </div>

            {blog.excerpt && (
              <div className="mt-4 p-4 bg-glass-blue/10 rounded-lg border-l-4 border-glass-blue">
                <p className="text-gray-700 dark:text-gray-300 italic">{blog.excerpt}</p>
              </div>
            )}
          </header>

          {/* Blog content */}
          <article 
            className="prose prose-lg max-w-none text-gray-700 dark:prose-invert dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Published by <span className="font-medium">{blog.author}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Esena Pharmacy - Your Trusted Healthcare Partner
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Link 
                  to="/blog"
                  className="glass-button-secondary"
                >
                  More Articles
                </Link>
                <Link 
                  to="/contact"
                  className="glass-button-primary"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </footer>
        </GlassCard>

        {/* Related content suggestion */}
        <div className="mt-8">
          <GlassCard className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              Need Personalized Health Advice?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Book an appointment with our healthcare professionals for personalized guidance.
            </p>
            <Link 
              to="/book-appointment"
              className="glass-button-primary"
            >
              Book Appointment
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;