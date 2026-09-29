import { useEffect, useRef, useState } from 'react';
import { api, productImage } from '@shared/api';
import { ksh } from '@shared/format';
import { CATEGORIES } from '@shared/categories';
import { Empty, Loading, Notice, Screen, useNav } from '@shared/ui';

/** The categories with the most in them come first; the rest are one scroll away. */
const TOP = ['OTC', 'PainRelief', 'ColdAndFlu', 'Supplements', 'PersonalCare', 'BabyMedicines', 'DiabetesCare', 'SkinConditions'];
const CHIPS = [
  ...TOP.map((value) => CATEGORIES.find((c) => c.value === value)).filter(Boolean),
  ...CATEGORIES.filter((c) => !TOP.includes(c.value)),
];

const PAGE = 20;

export function Shop() {
  const nav = useNav();
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const request = useRef(0);

  // Debounce typing, so each keystroke is not a request on a phone connection.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 400);
    return () => clearTimeout(t);
  }, [query]);

  async function load(offset) {
    const id = ++request.current;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: String(PAGE), offset: String(offset) });
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    try {
      const data = await api(`/products?${params}`);
      if (id !== request.current) return;
      setTotal(data.total ?? 0);
      setProducts((prev) => (offset === 0 ? data.products : [...prev, ...data.products]));
    } catch (e) {
      if (id === request.current) setError(e.message);
    } finally {
      if (id === request.current) setLoading(false);
    }
  }

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  return (
    <Screen title="Esena Pharmacy">
      <div className="stack">
        <input
          className="input"
          type="search"
          placeholder="Search medicines and products"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <div className="chips" role="list">
          <button className={`chip ${category === '' ? 'chip-on' : ''}`} onClick={() => setCategory('')}>
            All
          </button>
          {CHIPS.map((c) => (
            <button key={c.value} className={`chip ${category === c.value ? 'chip-on' : ''}`} onClick={() => setCategory(c.value)}>
              {c.label}
            </button>
          ))}
        </div>

        {error ? <Notice tone="bad">{error}</Notice> : null}

        {!loading && products.length === 0 && !error ? (
          <Empty title="Nothing found">Try another search or category, or upload a prescription and we will source it for you.</Empty>
        ) : null}

        <div className="grid">
          {products.map((p) => (
            <button key={p.id} className="product" onClick={() => nav.push('product', { id: p.id, product: p })}>
              <div className="product-img">
                {productImage(p.image) ? <img src={productImage(p.image)} alt="" loading="lazy" /> : <span>💊</span>}
              </div>
              <span className="product-name">{p.name}</span>
              <span className="row between">
                <span className="price">{ksh(p.price)}</span>
                <span className={`small ${Number(p.stock) > 0 ? 'muted' : 'out'}`}>{Number(p.stock) > 0 ? 'In stock' : 'Out of stock'}</span>
              </span>
            </button>
          ))}
        </div>

        {loading ? <Loading /> : null}
        {!loading && products.length < total ? (
          <button className="btn btn-ghost" onClick={() => load(products.length)}>
            Show more ({total - products.length} left)
          </button>
        ) : null}
      </div>
    </Screen>
  );
}
