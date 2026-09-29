import { useState } from 'react';
import { api } from '@shared/api';
import { dateTime, ksh } from '@shared/format';
import { Badge, Button, Empty, Field, Loading, Notice, Screen, useLoad, useNav } from '@shared/ui';
import { history } from '../store';

/** Orders this phone placed, plus looking one up by its tracking code. */
export function Orders() {
  const nav = useNav();
  const [code, setCode] = useState('');
  const mine = history.orders();
  const appointments = history.appointments();

  return (
    <Screen title="My orders">
      <div className="stack">
        <div className="card stack">
          <Field label="Track with a code" hint="The code is in your order confirmation email.">
            <input className="input" value={code} onChange={(e) => setCode(e.target.value.trim())} autoCapitalize="characters" placeholder="Tracking code" />
          </Field>
          <Button variant="navy" disabled={code.length < 4} onClick={() => nav.push('track', { token: code })}>
            Track order
          </Button>
        </div>

        {mine.length === 0 ? <Empty title="No orders on this phone yet">Orders you place in the app appear here.</Empty> : null}
        {mine.map((o) => (
          <button key={o.token} className="list-item" onClick={() => nav.push('track', { token: o.token })}>
            <span style={{ fontSize: 22 }}>📦</span>
            <span style={{ flex: 1 }}>
              <span className="h3">Order #{o.orderId}</span>
              <br />
              <span className="small muted">{dateTime(o.placedAt)}</span>
            </span>
            <span className="price small">{ksh(o.total)}</span>
          </button>
        ))}

        {appointments.length > 0 ? <p className="h3" style={{ marginTop: 8 }}>Appointments</p> : null}
        {appointments.map((a) => (
          <button key={a.token} className="list-item" onClick={() => nav.push('appointment', { token: a.token })}>
            <span style={{ fontSize: 22 }}>📅</span>
            <span style={{ flex: 1 }}>
              <span className="h3">{a.service}</span>
              <br />
              <span className="small muted">{a.when}</span>
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

export function Track({ token, fresh }) {
  const nav = useNav();
  const { data, error, loading, reload } = useLoad(() => api(`/orders/${encodeURIComponent(token)}`), [token]);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  async function cancel() {
    setCancelling(true);
    setCancelError(null);
    try {
      await api(`/orders/cancel/${encodeURIComponent(token)}`, { method: 'POST', body: { reason: 'Cancelled by customer in the app' } });
      reload();
    } catch (e) {
      setCancelError(e.message);
    } finally {
      setCancelling(false);
    }
  }

  const order = data;
  const canCancel = order && ['pending', 'payment_requested'].includes(order.status);
  const canPay = order && ['pending', 'payment_requested'].includes(order.status) && !/cod/.test(order.notes || '');

  return (
    <Screen title="Order" onBack={fresh ? () => nav.reset('orders') : nav.back}>
      {loading ? <Loading /> : null}
      {error ? <Notice tone="bad">{error.status === 404 ? 'No order with that code. Check it and try again.' : error.message}</Notice> : null}
      {order ? (
        <div className="stack">
          {fresh ? <Notice tone="good">Order placed. A confirmation is on its way to {order.email}.</Notice> : null}
          <div className="card stack" style={{ gap: 8 }}>
            <div className="row between">
              <span className="h3">Order #{order.id}</span>
              <Badge status={order.status} />
            </div>
            <dl className="kv">
              <dt>Placed</dt><dd>{dateTime(order.created_at)}</dd>
              <dt>{order.delivery_type === 'pickup' ? 'Pickup' : 'Deliver to'}</dt><dd>{order.delivery_address}</dd>
              <dt>Tracking code</dt><dd><strong>{order.token}</strong></dd>
            </dl>
          </div>
          <div className="card stack" style={{ gap: 6 }}>
            {(order.items || []).map((item) => (
              <div key={item.id ?? item.product_id} className="row between small">
                <span>{item.quantity} × {item.name}</span>
                <span>{ksh(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="row between small"><span>Delivery</span><span>{ksh(order.shipping_cost)}</span></div>
            <div className="divider" />
            <div className="row between"><span className="h3">Total</span><span className="price">{ksh(order.total)}</span></div>
          </div>
          {canPay ? (
            <Button onClick={() => nav.push('pay', { orderId: order.id, token: order.token, amount: Number(order.total), phone: order.phone })}>
              Pay {ksh(order.total)} with M-Pesa
            </Button>
          ) : null}
          {cancelError ? <Notice tone="bad">{cancelError}</Notice> : null}
          {canCancel ? (
            <Button variant="danger" busy={cancelling} onClick={cancel}>
              Cancel this order
            </Button>
          ) : null}
          <Button variant="ghost" onClick={reload}>Refresh status</Button>
        </div>
      ) : null}
    </Screen>
  );
}
