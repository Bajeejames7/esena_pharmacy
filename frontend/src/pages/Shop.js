import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useBreakpoint } from '../utils/responsive';
import GlassCard from '../components/GlassCard';

const Shop = () => {
  const { items, total, itemCount, isEmpty, updateQuantity, removeFromCart, clearCart } = useCart();
  const { breakpoint } = useBreakpoint();

  const safeTotal = parseFloat(total) || 0;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  if (isEmpty) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h1 className="text-gray-800 dark:text-white mb-4">Shopping Cart</h1>
            <div className="py-12">
              <img src="/cart.png" alt="Shopping Cart" className="w-16 h-16 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-6">Your cart is empty</p>
              <Link to="/products" className="glass-button-primary">Continue Shopping</Link>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 pb-12 lg:pt-24 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid gap-4 sm:gap-6 lg:gap-8 ${breakpoint === 'desktop' ? 'grid-cols-3' : 'grid-cols-1'}`}>
          <div className={breakpoint === 'desktop' ? 'col-span-2' : ''}>
            <GlassCard className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-gray-800 dark:text-white">Shopping Cart ({itemCount} items)</h1>
                <button onClick={clearCart} className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">
                  Clear Cart
                </button>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-white/10 rounded-lg">
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h3 className="font-medium text-gray-800 dark:text-white truncate text-sm sm:text-base">{item.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">KSH {parseFloat(item.price).toFixed(2)} each</p>
                      {item.category && <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>}
                    </div>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto">
                      <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-gray-700 transition-colors" aria-label="Decrease quantity">-</button>
                      <span className="w-12 text-center font-medium text-gray-800 dark:text-white">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-gray-700 transition-colors" aria-label="Increase quantity">+</button>
                    </div>
                    <div className="text-right min-w-0 w-full sm:w-auto sm:text-right">
                      <p className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">KSH {(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-600 hover:text-red-800 p-1 transition-colors" aria-label="Remove item">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className={breakpoint === 'desktop' ? 'col-span-1' : ''}>
            <GlassCard className="p-4 sm:p-6 sticky top-20 lg:top-24">
              <h2 className="text-gray-800 dark:text-white mb-4 sm:mb-6 text-lg sm:text-xl">Order Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                  <span className="text-gray-800 dark:text-white font-bold">KSH {safeTotal.toFixed(2)}</span>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between">
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Delivery fee calculated at checkout</p>
                </div>
              </div>
              <div className="space-y-3">
                <Link to="/checkout" className="glass-button-primary w-full block text-center">Proceed to Checkout</Link>
                <Link to="/products" className="glass-button-secondary w-full block text-center">Continue Shopping</Link>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Secure checkout guaranteed</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
