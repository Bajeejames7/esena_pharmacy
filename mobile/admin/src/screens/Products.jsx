import { useEffect, useRef, useState } from 'react';
import { api, productImage } from '@shared/api';
import { ksh } from '@shared/format';
import { CATEGORIES } from '@shared/categories';
import { Button, Empty, Field, Loading, Notice, Screen, useNav } from '@shared/ui';
import { adminApi } from '../session';

/** Stock and price at a glance, and quick edits to either. */
export function Products() {
  const nav = useNav();
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const request = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  async function load(offset) {
    const id = ++request.current;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: '40', offset: String(offset) });
    if (search) params.set('search', search);
    try {
      const data = await api(`/products?${params}`);
      if (id !== request.current) return;
      setTotal(data.total ?? 0);
      setItems((prev) => (offset === 0 ? data.products : [...prev, ...data.products]));
    } catch (e) {
      if (id === request.current) setError(e.message);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const shown = lowOnly ? items.filter((p) => Number(p.stock) <= 5) : items;

  return (
    <Screen title="Products">
      <div className="stack">
        <input className="input" type="search" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips">
          <button className={`chip ${!lowOnly ? 'chip-on' : ''}`} onClick={() => setLowOnly(false)}>All loaded</button>
          <button className={`chip ${lowOnly ? 'chip-on' : ''}`} onClick={() => setLowOnly(true)}>Low stock (≤ 5)</button>
        </div>
        {error ? <Notice tone="bad">{error}</Notice> : null}
        {!loading && shown.length === 0 ? <Empty title="No products found" /> : null}
        {shown.map((p) => (
          <button key={p.id} className="list-item" onClick={() => nav.push('product', { product: p })}>
            <span className="thumb">{productImage(p.image) ? <img src={productImage(p.image)} alt="" /> : '💊'}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="h3 clamp">{p.name}</span>
              <span className="row between small">
                <span className="price">{ksh(p.price)}</span>
                <span className={Number(p.stock) <= 5 ? 'low' : 'muted'}>{Number(p.stock)} in stock</span>
              </span>
            </span>
          </button>
        ))}
        {loading ? <Loading /> : null}
        {!loading && items.length < total ? (
          <button className="btn btn-ghost" onClick={() => load(items.length)}>Load more ({total - items.length} left)</button>
        ) : null}
      </div>
    </Screen>
  );
}

const MOVES = [
  ['restock', 'Restock', 'Stock received (adds)'],
  ['adjustment', 'Adjustment', 'Count correction (+ or −)'],
  ['damage', 'Damaged / expired', 'Removes from stock'],
  ['return', 'Customer return', 'Adds back to stock'],
];

/**
 * Stock changes go through POST /inventory/:id/movements rather than the
 * product PUT: every change lands in the stock-movement history with the
 * staff member's name, which is what the website's inventory screen reads.
 *
 * Price is read-only here on purpose. The product PUT runs sanitizeInput,
 * which HTML-escapes the name it has to be sent back — "200MG/5ML" would be
 * saved as "200MG&#x2F;5ML" on every edit. Until that is fixed on the server,
 * editing through it from the app would slowly corrupt the catalogue.
 */
export function ProductEdit({ product: initial }) {
  const nav = useNav();
  const [stock, setStock] = useState(Number(initial.stock) || 0);
  const [type, setType] = useState('restock');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const category = CATEGORIES.find((c) => c.value === initial.category)?.label ?? initial.category;

  async function record() {
    const q = parseInt(quantity, 10);
    if (!Number.isInteger(q) || q === 0) return setMessage({ tone: 'bad', text: 'Enter a quantity (not 0).' });
    if (type !== 'adjustment' && q < 0) return setMessage({ tone: 'bad', text: 'Use a positive number; the type decides the direction.' });
    setBusy(true);
    setMessage(null);
    try {
      const res = await adminApi(`/inventory/${initial.id}/movements`, { method: 'POST', body: { type, quantity: q, note: note.trim() || undefined } });
      const next = Number(res?.newStock ?? res?.stock ?? (type === 'damage' ? stock - Math.abs(q) : stock + q));
      setStock(next);
      setQuantity('');
      setNote('');
      setMessage({ tone: 'good', text: `Recorded. Stock is now ${next}.` });
    } catch (e) {
      setMessage({ tone: 'bad', text: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Stock" onBack={nav.back}>
      <div className="stack">
        <div className="card row">
          <span className="thumb big-thumb">{productImage(initial.image) ? <img src={productImage(initial.image)} alt="" /> : '💊'}</span>
          <span>
            <span className="h3">{initial.name}</span>
            <br />
            <span className="small muted">{category}</span>
            <br />
            <span className="price">{ksh(initial.price)}</span> <span className="small muted">· {stock} in stock</span>
          </span>
        </div>
        <Field label="What happened?">
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}>
            {MOVES.map(([value, label, hint]) => <option key={value} value={value}>{label} — {hint}</option>)}
          </select>
        </Field>
        <Field label="Quantity" hint={type === 'adjustment' ? 'Use a minus sign to reduce, e.g. -3.' : undefined}>
          <input className="input" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value.replace(type === 'adjustment' ? /[^\d-]/g : /\D/g, ''))} />
        </Field>
        <Field label="Note (optional)"><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Supplier, invoice, reason…" /></Field>
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
        <Button variant="navy" busy={busy} onClick={record}>Record stock change</Button>
        <p className="small muted">Prices, photos and descriptions are edited on the website admin panel.</p>
      </div>
    </Screen>
  );
}
