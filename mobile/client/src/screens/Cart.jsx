import { productImage } from '@shared/api';
import { ksh } from '@shared/format';
import { Button, Empty, Screen, useNav } from '@shared/ui';
import { useCart } from '../store';

export function Cart() {
  const nav = useNav();
  const cart = useCart();

  return (
    <Screen title="Your cart">
      {cart.items.length === 0 ? (
        <Empty title="Your cart is empty">Browse the shop and add what you need.</Empty>
      ) : (
        <div className="stack">
          {cart.items.map((item) => (
            <div key={item.id} className="card row">
              <div className="thumb">{productImage(item.image) ? <img src={productImage(item.image)} alt="" /> : <span>💊</span>}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="h3 clamp">{item.name}</p>
                <p className="price small">{ksh(item.price)}</p>
              </div>
              <div className="stepper">
                <button onClick={() => cart.setQuantity(item.id, item.quantity - 1)} aria-label={`One less ${item.name}`}>
                  {item.quantity === 1 ? '🗑' : '−'}
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => cart.setQuantity(item.id, item.quantity + 1)} aria-label={`One more ${item.name}`}>+</button>
              </div>
            </div>
          ))}
          <div className="card row between">
            <span className="h3">Subtotal</span>
            <span className="price">{ksh(cart.subtotal)}</span>
          </div>
          <p className="small muted">Delivery is added at checkout. Pickup from the pharmacy is free.</p>
          <Button onClick={() => nav.push('checkout')}>Checkout</Button>
        </div>
      )}
    </Screen>
  );
}
