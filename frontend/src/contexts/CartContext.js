import { createContext, useContext, useReducer, useEffect, useRef } from 'react';

/**
 * Shopping cart context and state management
 * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */

const CART_KEY = 'esena_cart_v2';

// Cart action types
export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

/**
 * Calculate cart totals
 */
const calculateCartTotals = (state) => {
  const total = state.items.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * item.quantity);
  }, 0);

  const itemCount = state.items.reduce((count, item) => {
    return count + item.quantity;
  }, 0);

  return {
    ...state,
    total: parseFloat(total.toFixed(2)),
    itemCount
  };
};

/**
 * Validate cart item structure
 */
const validateCartItem = (item) => {
  if (!item || typeof item !== 'object') return false;
  return (
    typeof item.id !== 'undefined' &&
    typeof item.name === 'string' &&
    item.name.length > 0 &&
    !isNaN(parseFloat(item.price)) &&
    parseFloat(item.price) >= 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
};

/**
 * Read persisted cart from localStorage synchronously.
 * Called as the useReducer initializer so the very first render
 * already has the saved items — no async load needed, no race condition.
 */
const resolveImageUrl = (item) => {
  if (item.imageUrl) return item.imageUrl;
  if (!item.image) return null;
  if (item.image.startsWith('http')) return item.image;
  const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${API_BASE}/uploads/products/${item.image}`;
};

const loadInitialState = () => {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.items && Array.isArray(parsed.items)) {
        // Re-resolve imageUrl for any items that were saved without it
        const validItems = parsed.items
          .filter(validateCartItem)
          .map(item => ({ ...item, imageUrl: resolveImageUrl(item) }));
        if (validItems.length > 0) {
          return calculateCartTotals({ items: validItems, total: 0, itemCount: 0 });
        }
      }
    }
  } catch (e) {
    // ignore — fall through to empty state
  }
  return { items: [], total: 0, itemCount: 0 };
};

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity, imageUrl: product.imageUrl || item.imageUrl }
            : item
        );
      } else {
        newItems = [...state.items, { ...product, quantity }];
      }

      return calculateCartTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { productId } = action.payload;
      const newItems = state.items.filter(item => item.id !== productId);
      return calculateCartTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;

      if (quantity <= 0) {
        const newItems = state.items.filter(item => item.id !== productId);
        return calculateCartTotals({ ...state, items: newItems });
      }

      const newItems = state.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );

      return calculateCartTotals({ ...state, items: newItems });
    }

    case CART_ACTIONS.CLEAR_CART: {
      return { items: [], total: 0, itemCount: 0 };
    }

    case CART_ACTIONS.LOAD_CART: {
      const { items } = action.payload;
      return calculateCartTotals({ ...state, items });
    }

    default:
      return state;
  }
};

// Create cart context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  // Pass loadInitialState as the initializer — runs once synchronously,
  // reads localStorage before the first render, no race condition.
  const [state, dispatch] = useReducer(cartReducer, undefined, loadInitialState);

  // Initialize lastSavedRef with whatever was loaded from localStorage
  // so the first effect run doesn't trigger a redundant write.
  const lastSavedRef = useRef(JSON.stringify(state.items));

  // Persist cart to localStorage on every change.
  // We skip the write if the serialized value hasn't changed (avoids
  // triggering the storage event in other tabs unnecessarily).
  useEffect(() => {
    try {
      const serialized = JSON.stringify({ items: state.items, timestamp: Date.now() });
      // Compare items only (ignore timestamp) to decide if we need to write
      const itemsJson = JSON.stringify(state.items);
      if (lastSavedRef.current === itemsJson) return;
      lastSavedRef.current = itemsJson;
      localStorage.setItem(CART_KEY, serialized);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Sync cart across tabs via the storage event
  // Note: browsers only fire 'storage' in OTHER tabs, never the current one,
  // so this won't interfere with normal cart operations.
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key !== CART_KEY) return;
      try {
        if (!e.newValue) {
          dispatch({ type: CART_ACTIONS.CLEAR_CART });
          return;
        }
        const parsed = JSON.parse(e.newValue);
        if (parsed.items && Array.isArray(parsed.items)) {
          const validItems = parsed.items.filter(validateCartItem);
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: { items: validItems } });
        }
      } catch (err) {
        // ignore malformed data
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    if (!validateCartItem({ ...product, quantity })) {
      console.error('Invalid product data:', product);
      return false;
    }
    dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { product, quantity } });
    return true;
  };

  const removeFromCart = (productId) => {
    dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { productId } });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item.id === productId);
  };

  const value = {
    items: state.items,
    total: state.total,
    itemCount: state.itemCount,
    isEmpty: state.items.length === 0,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Export for testing
export { calculateCartTotals, validateCartItem };
