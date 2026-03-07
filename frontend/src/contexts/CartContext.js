import React, { createContext, useContext, useReducer, useEffect } from 'react';

/**
 * Shopping cart context and state management
 * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */

// Cart action types
export const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Initial cart state
const initialState = {
  items: [],
  total: 0,
  itemCount: 0
};

// Cart reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      
      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
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
        // Remove item if quantity is 0 or negative
        const newItems = state.items.filter(item => item.id !== productId);
        return calculateCartTotals({ ...state, items: newItems });
      }
      
      const newItems = state.items.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      
      return calculateCartTotals({ ...state, items: newItems });
    }
    
    case CART_ACTIONS.CLEAR_CART: {
      return { ...initialState };
    }
    
    case CART_ACTIONS.LOAD_CART: {
      const { items } = action.payload;
      return calculateCartTotals({ ...state, items });
    }
    
    default:
      return state;
  }
};

/**
 * Calculate cart totals
 * Implements Requirements 4.6 - Calculate cart total dynamically
 */
const calculateCartTotals = (state) => {
  const total = state.items.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
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
  if (!item || typeof item !== 'object') {
    return false;
  }
  
  return (
    typeof item.id !== 'undefined' &&
    typeof item.name === 'string' &&
    item.name.length > 0 &&
    typeof item.price === 'number' &&
    item.price >= 0 &&
    typeof item.quantity === 'number' &&
    item.quantity > 0
  );
};

// Create cart context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('esena_cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items && Array.isArray(parsedCart.items)) {
          // Validate all items before loading
          const validItems = parsedCart.items.filter(validateCartItem);
          dispatch({
            type: CART_ACTIONS.LOAD_CART,
            payload: { items: validItems }
          });
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Clear invalid cart data
      localStorage.removeItem('esena_cart');
    }
  }, []);

  // Save cart to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('esena_cart', JSON.stringify({
        items: state.items,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [state.items]);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    if (!validateCartItem({ ...product, quantity })) {
      console.error('Invalid product data:', product);
      return false;
    }
    
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product, quantity }
    });
    return true;
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
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

  // Context value
  const value = {
    // State
    items: state.items,
    total: state.total,
    itemCount: state.itemCount,
    isEmpty: state.items.length === 0,
    
    // Actions
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