import { Link } from 'react-router-dom';
import GlassCard from '../components/GlassCard';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <GlassCard className="max-w-md w-full text-center p-10" blur="lg">
        <div className="text-8xl mb-4">💊</div>
        <h1 className="text-6xl font-bold text-gray-800 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Looks like this page doesn't exist. It may have been moved or the URL might be wrong.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-glass-blue text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Go Home
          </Link>
          <Link
            to="/products"
            className="px-6 py-3 border border-glass-blue text-glass-blue dark:text-blue-400 rounded-lg hover:bg-glass-blue/10 transition-colors font-medium"
          >
            Browse Products
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default NotFound;
