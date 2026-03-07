import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CartProvider, useCart, calculateCartTotals, validateCartItem, CART_ACTIONS } from './CartContext';

/**
 * Property tests for cart functionality
 * Implements Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 * Property 3: Order Total Correctness
 */

// Test component to access cart context
const TestCartComponent = ({ onCartUpdate }) => {
  const cart = useCart();
  
  React.useEffect(() => {
    if (onCartUpdate) {
      onCartUpdate(cart);
    }
  }, [cart, onCartUpdate]);

  return (
    <div>
      <div data-testid="item-count">{cart.itemCount}</div>
      <div data-testid="total">{cart.total}</div>
      <div data-testid="items-length">{cart.items.length}</div>
      <button 
        data-testid="add-item"
        onClick={() => cart.addToCart({ id: 1, name: 'Test Product', price: 10.99 }, 1)}
      >
        Add Item
      </button>
      <button 
        data-testid="remove-item"
        onClick={() => cart.removeFromCart(1)}
      >
        Remove Item
      </button>
      <button 
        data-testid="update-quantity"
        onClick={() => cart.updateQuantity(1, 3)}
      >
        Update Quantity
      </button>
      <button 
        data-testid="clear-cart"
        onClick={() => cart.clearCart()}
      >
        Clear Cart
      </button>
    </div>
  );
};

describe('Cart Context Property Tests', () => {
  // Mock localStorage
  const mockLocalStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn()
  };
  
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    jest.clearAllMocks();
  });

  /**
   * Property 3: Order Total Correctness
   * Validates: Requirements 4.6
   * Test that cart total equals sum of all item subtotals
   */
  test('Property 3: Cart total equals sum of all item subtotals', () => {
    const testCases = [
      // Single item
      { items: [{ id: 1, price: 10.99, quantity: 1 }], expectedTotal: 10.99 },
      // Multiple items
      { items: [
        { id: 1, price: 10.99, quantity: 2 },
        { id: 2, price: 5.50, quantity: 1 }
      ], expectedTotal: 27.48 },
      // Decimal precision
      { items: [
        { id: 1, price: 9.99, quantity: 3 },
        { id: 2, price: 12.50, quantity: 2 }
      ], expectedTotal: 54.97 },
      // Large quantities
      { items: [
        { id: 1, price: 1.99, quantity: 10 },
        { id: 2, price: 0.99, quantity: 5 }
      ], expectedTotal: 24.85 },
      // Empty cart
      { items: [], expectedTotal: 0 }
    ];

    testCases.forEach(({ items, expectedTotal }) => {
      const state = { items };
      const result = calculateCartTotals(state);
      
      expect(result.total).toBe(expectedTotal);
      
      // Verify manual calculation matches
      const manualTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      expect(result.total).toBe(parseFloat(manualTotal.toFixed(2)));
    });
  });

  test('Property 3: Cart total with various item combinations', () => {
    let cartState = null;
    
    render(
      <CartProvider>
        <TestCartComponent onCartUpdate={(cart) => { cartState = cart; }} />
      </CartProvider>
    );

    // Test adding multiple different items
    const testItems = [
      { id: 1, name: 'Product 1', price: 15.99 },
      { id: 2, name: 'Product 2', price: 8.50 },
      { id: 3, name: 'Product 3', price: 22.75 }
    ];

    testItems.forEach((item, index) => {
      act(() => {
        cartState.addToCart(item, index + 1); // quantities: 1, 2, 3
      });
    });

    // Expected total: (15.99 * 1) + (8.50 * 2) + (22.75 * 3) = 15.99 + 17.00 + 68.25 = 101.24
    expect(cartState.total).toBe(101.24);
    expect(cartState.itemCount).toBe(6); // 1 + 2 + 3
  });

  test('Cart operations work correctly', () => {
    let cartState = null;
    
    render(
      <CartProvider>
        <TestCartComponent onCartUpdate={(cart) => { cartState = cart; }} />
      </CartProvider>
    );

    // Initial state
    expect(cartState.isEmpty).toBe(true);
    expect(cartState.total).toBe(0);
    expect(cartState.itemCount).toBe(0);

    // Add item
    act(() => {
      fireEvent.click(screen.getByTestId('add-item'));
    });

    expect(cartState.items).toHaveLength(1);
    expect(cartState.total).toBe(10.99);
    expect(cartState.itemCount).toBe(1);
    expect(cartState.isInCart(1)).toBe(true);

    // Update quantity
    act(() => {
      fireEvent.click(screen.getByTestId('update-quantity'));
    });

    expect(cartState.getItemQuantity(1)).toBe(3);
    expect(cartState.total).toBe(32.97); // 10.99 * 3
    expect(cartState.itemCount).toBe(3);

    // Remove item
    act(() => {
      fireEvent.click(screen.getByTestId('remove-item'));
    });

    expect(cartState.isEmpty).toBe(true);
    expect(cartState.total).toBe(0);
    expect(cartState.itemCount).toBe(0);
  });

  test('localStorage persistence works correctly', () => {
    mockLocalStorage.getItem.mockReturnValue(JSON.stringify({
      items: [{ id: 1, name: 'Saved Product', price: 5.99, quantity: 2 }],
      timestamp: Date.now()
    }));

    let cartState = null;
    
    render(
      <CartProvider>
        <TestCartComponent onCartUpdate={(cart) => { cartState = cart; }} />
      </CartProvider>
    );

    // Should load from localStorage
    expect(cartState.items).toHaveLength(1);
    expect(cartState.total).toBe(11.98);
    expect(cartState.itemCount).toBe(2);

    // Should save to localStorage when adding item
    act(() => {
      cartState.addToCart({ id: 2, name: 'New Product', price: 3.50 }, 1);
    });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'esena_cart',
      expect.stringContaining('"items"')
    );
  });

  test('Cart validation prevents invalid items', () => {
    const validItem = { id: 1, name: 'Valid Product', price: 10.99, quantity: 1 };
    const invalidItems = [
      null,
      undefined,
      {},
      { id: 1 }, // missing required fields
      { id: 1, name: 'Test', price: -5, quantity: 1 }, // negative price
      { id: 1, name: 'Test', price: 10, quantity: 0 }, // zero quantity
      { id: 1, name: 'Test', price: 10, quantity: -1 }, // negative quantity
    ];

    expect(validateCartItem(validItem)).toBe(true);
    
    invalidItems.forEach(item => {
      expect(validateCartItem(item)).toBe(false);
    });
  });

  test('Error handling for localStorage failures', () => {
    // Mock localStorage to throw error
    mockLocalStorage.getItem.mockImplementation(() => {
      throw new Error('localStorage error');
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <CartProvider>
        <TestCartComponent />
      </CartProvider>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error loading cart from localStorage:',
      expect.any(Error)
    );
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('esena_cart');

    consoleSpy.mockRestore();
  });

  test('Cart context throws error when used outside provider', () => {
    const TestComponent = () => {
      useCart(); // This should throw
      return <div>Test</div>;
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCart must be used within a CartProvider');

    consoleSpy.mockRestore();
  });

  test('Decimal precision is maintained in calculations', () => {
    const items = [
      { id: 1, price: 9.99, quantity: 3 },
      { id: 2, price: 12.50, quantity: 2 },
      { id: 3, price: 0.99, quantity: 7 }
    ];

    const state = { items };
    const result = calculateCartTotals(state);

    // Expected: (9.99 * 3) + (12.50 * 2) + (0.99 * 7) = 29.97 + 25.00 + 6.93 = 61.90
    expect(result.total).toBe(61.90);
    expect(result.itemCount).toBe(12);
  });
});