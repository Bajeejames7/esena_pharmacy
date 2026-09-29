import { useState } from 'react';
import { api, productImage } from '@shared/api';
import { ksh } from '@shared/format';
import { CATEGORIES } from '@shared/categories';
import { Button, Loading, Notice, Screen, useLoad, useNav } from '@shared/ui';
import { useCart } from '../store';

export function Product({ id, product: preview }) {
  const nav = useNav();
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { data, loading, error } = useLoad(() => api(`/products/${id}`), [id]);

  // Show what the list already knew while the full record loads.
  const product = data?.product ?? data ?? preview;
  const stock = Number(product?.stock) || 0;
  const category = CATEGORIES.find((c) => c.value === product?.category)?.label;

  return (
    <Screen title="Product" onBack={nav.back}>
      {!product && loading ? <Loading /> : null}
      {error && !product ? <Notice tone="bad">{error.message}</Notice> : null}
      {product ? (
        <div className="stack">
          <div className="card product-hero">
            {productImage(product.image) ? <img src={productImage(product.image)} alt={product.name} /> : <span className="hero-icon">💊</span>}
          </div>
          <div>
            {category ? <p className="small muted">{category}</p> : null}
            <p className="h2">{product.name}</p>
            <p className="price big">{ksh(product.price)}</p>
            <p className={`small ${stock > 0 ? 'muted' : 'out'}`}>{stock > 0 ? `${stock} in stock` : 'Out of stock right now'}</p>
          </div>
          {product.description ? <p className="card">{product.description}</p> : null}

          {product.category === 'Prescription' ? (
            <Notice tone="warn">This medicine needs a prescription. You can upload it from the Services tab.</Notice>
          ) : null}

          {stock > 0 ? (
            <>
              <div className="row between card">
                <span className="h3">Quantity</span>
                <div className="stepper">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Fewer">−</button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(stock, q + 1))} aria-label="More">+</button>
                </div>
              </div>
              <Button
                onClick={() => {
                  cart.add(product, quantity);
                  setAdded(true);
                }}
              >
                Add to cart · {ksh(Number(product.price) * quantity)}
              </Button>
              {added ? (
                <Notice tone="good">
                  Added. <button className="link" onClick={() => nav.reset('cart')}>Go to cart ({cart.count})</button>
                </Notice>
              ) : null}
            </>
          ) : (
            <Button variant="ghost" onClick={() => nav.push('contact', { subject: `Stock request: ${product.name}` })}>
              Ask us to get it for you
            </Button>
          )}
        </div>
      ) : null}
    </Screen>
  );
}
