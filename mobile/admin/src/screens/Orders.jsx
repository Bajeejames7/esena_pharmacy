import { useMemo, useState } from 'react';
import { dateTime, ksh, statusLabel } from '@shared/format';
import { Badge, Button, Empty, Field, Loading, Notice, Screen, useLoad, useNav } from '@shared/ui';
import { adminApi } from '../session';

/**
 * The next statuses the server will accept, copied from updateOrderStatus's
 * validTransitions in backend/controllers/orderController.js. Showing only
 * these means a pharmacist never taps a button the API will refuse.
 */
export function nextStatuses(order) {
  switch (order.status) {
    case 'pending': return ['payment_requested', 'completed'];
    case 'payment_requested': return ['paid', 'completed'];
    case 'paid': return order.delivery_type === 'pickup' ? ['ready_for_pickup', 'completed'] : ['dispatched', 'completed'];
    case 'dispatched':
    case 'ready_for_pickup': return ['completed'];
    default: return [];
  }
}

const FILTERS = [
  ['open', 'Open'],
  ['pending', 'Pending'],
  ['paid', 'Paid'],
  ['dispatched', 'On the way'],
  ['completed', 'Completed'],
  ['cancelled', 'Cancelled'],
  ['all', 'All'],
];
const OPEN = ['pending', 'payment_requested', 'paid', 'dispatched', 'ready_for_pickup', 'processing'];

export function Orders() {
  const nav = useNav();
  const [filter, setFilter] = useState('open');
  const [query, setQuery] = useState('');
  const { data, error, loading, reload } = useLoad(() => adminApi('/orders?limit=300'), []);

  const orders = useMemo(() => {
    const list = data?.orders ?? [];
    const q = query.trim().toLowerCase();
    return list.filter((o) => {
      if (filter === 'open' && !OPEN.includes(o.status)) return false;
      if (!['open', 'all'].includes(filter) && o.status !== filter) return false;
      if (!q) return true;
      return [o.id, o.customer_name, o.phone, o.token].some((v) => String(v ?? '').toLowerCase().includes(q));
    });
  }, [data, filter, query]);

  return (
    <Screen title="Orders" action={<button onClick={reload}>Refresh</button>}>
      <div className="stack">
        <input className="input" type="search" placeholder="Search name, phone, order # or code" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="chips">
          {FILTERS.map(([value, label]) => (
            <button key={value} className={`chip ${filter === value ? 'chip-on' : ''}`} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
        {loading ? <Loading /> : null}
        {error ? <Notice tone="bad">{error.message}</Notice> : null}
        {!loading && orders.length === 0 ? <Empty title="No orders here" /> : null}
        {orders.map((o) => (
          <button key={o.id} className="list-item" onClick={() => nav.push('order', { id: o.id })}>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="row between"><span className="h3">#{o.id} · {o.customer_name}</span><Badge status={o.status} /></span>
              <span className="row between small muted">
                <span>{dateTime(o.created_at)} · {o.delivery_type === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                <span className="price">{ksh(o.total)}</span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

export function Order({ id }) {
  const nav = useNav();
  const { data: order, error, loading, reload } = useLoad(() => adminApi(`/orders/${id}/details`), [id]);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [shipping, setShipping] = useState('');
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function run(label, fn) {
    setBusy(label);
    setMessage(null);
    try {
      await fn();
      setMessage({ tone: 'good', text: 'Saved.' });
      reload();
    } catch (e) {
      setMessage({ tone: 'bad', text: e.message });
    } finally {
      setBusy(null);
    }
  }

  const setStatus = (status) => run(status, () => adminApi(`/orders/${id}/status`, { method: 'PUT', body: { status } }));
  const cancel = () => run('cancel', () => adminApi(`/orders/${id}/cancel`, { method: 'POST', body: { reason: 'Cancelled by staff (mobile app)' } }));
  const saveShipping = () => run('shipping', () => adminApi(`/orders/${id}/shipping`, { method: 'PUT', body: { shipping_cost: Number(shipping) } }));

  return (
    <Screen title={`Order #${id}`} onBack={nav.back}>
      {loading && !order ? <Loading /> : null}
      {error ? <Notice tone="bad">{error.message}</Notice> : null}
      {order ? (
        <div className="stack">
          <div className="card stack" style={{ gap: 8 }}>
            <div className="row between"><span className="h3">{order.customer_name}</span><Badge status={order.status} /></div>
            <dl className="kv">
              <dt>Phone</dt><dd><a className="link" href={`tel:${order.phone}`}>{order.phone}</a></dd>
              <dt>Email</dt><dd>{order.email}</dd>
              <dt>{order.delivery_type === 'pickup' ? 'Pickup' : 'Deliver to'}</dt><dd>{order.delivery_address}</dd>
              <dt>Placed</dt><dd>{dateTime(order.created_at)}</dd>
              {order.notes ? (<><dt>Notes</dt><dd>{order.notes}</dd></>) : null}
              {order.mpesa_receipt ? (<><dt>M-Pesa</dt><dd>{order.mpesa_receipt}</dd></>) : null}
              <dt>Code</dt><dd>{order.token}</dd>
            </dl>
          </div>

          <div className="card stack" style={{ gap: 6 }}>
            {(order.items || []).map((item) => (
              <div key={item.id} className="row between small"><span>{item.quantity} × {item.name}</span><span>{ksh(item.price * item.quantity)}</span></div>
            ))}
            <div className="row between small"><span>Delivery</span><span>{ksh(order.shipping_cost)}</span></div>
            <div className="divider" />
            <div className="row between"><span className="h3">Total</span><span className="price">{ksh(order.total)}</span></div>
          </div>

          {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

          {nextStatuses(order).length ? (
            <div className="card stack">
              <span className="h3">Move to</span>
              {nextStatuses(order).map((status) => (
                <Button key={status} variant={status === 'completed' ? 'ghost' : 'navy'} busy={busy === status} disabled={Boolean(busy)} onClick={() => setStatus(status)}>
                  {statusLabel(status)}
                </Button>
              ))}
            </div>
          ) : null}

          {['pending', 'payment_requested'].includes(order.status) ? (
            <div className="card stack">
              <Field label="Delivery fee (KSh)" hint="Changes the order total.">
                <input className="input" inputMode="numeric" value={shipping} placeholder={String(Number(order.shipping_cost) || 0)} onChange={(e) => setShipping(e.target.value.replace(/[^\d.]/g, ''))} />
              </Field>
              <Button variant="ghost" busy={busy === 'shipping'} disabled={shipping === '' || Boolean(busy)} onClick={saveShipping}>Update delivery fee</Button>
            </div>
          ) : null}

          {!['completed', 'cancelled'].includes(order.status) ? (
            confirmCancel ? (
              <div className="card stack">
                <Notice tone="warn">Cancel order #{order.id}? Stock is returned and the customer is told.</Notice>
                <Button variant="danger" busy={busy === 'cancel'} onClick={cancel}>Yes, cancel the order</Button>
                <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Keep it</Button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmCancel(true)}>Cancel order…</Button>
            )
          ) : null}
        </div>
      ) : null}
    </Screen>
  );
}
