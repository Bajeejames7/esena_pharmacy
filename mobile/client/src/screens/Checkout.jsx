import { useState } from 'react';
import { api } from '@shared/api';
import { isEmail, isPhone, ksh } from '@shared/format';
import { Button, Field, Notice, Screen, useLoad, useNav } from '@shared/ui';
import { customer, history, useCart } from '../store';

/** Same text the website's Checkout sends for a pickup order. */
const PICKUP_ADDRESS = 'Esena Pharmacy, Outering Road, Behind Eastmart Supermarket, Ruaraka, Nairobi';

export function Checkout() {
  const nav = useNav();
  const cart = useCart();
  const [form, setForm] = useState(() => ({ ...customer.get(), deliveryType: 'delivery', zone: 'nairobi', payment: 'mpesa', notes: '' }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const prices = useLoad(() => api('/settings/delivery'), []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const fees = prices.data ?? { delivery_nairobi: 150, delivery_outside_nairobi: 350, pickup_cost: 0 };
  const shipping =
    form.deliveryType === 'pickup'
      ? Number(fees.pickup_cost) || 0
      : form.zone === 'outside_nairobi'
        ? Number(fees.delivery_outside_nairobi) || 350
        : Number(fees.delivery_nairobi) || 150;
  const total = cart.subtotal + shipping;

  function validate() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name.';
    if (!isEmail(form.email)) e.email = 'Enter a valid email — your receipt and tracking link go there.';
    if (!isPhone(form.phone)) e.phone = 'Enter a phone number (10–15 digits).';
    if (form.deliveryType === 'delivery') {
      if (form.address.trim().length < 3) e.address = 'Where should we deliver?';
      if (form.city.trim().length < 2) e.city = 'Enter your town or area.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder() {
    if (!validate()) return;
    setBusy(true);
    setFailure(null);
    customer.save({ name: form.name, email: form.email, phone: form.phone, address: form.address, city: form.city, landmark: form.landmark });

    const deliveryAddress =
      form.deliveryType === 'pickup'
        ? PICKUP_ADDRESS
        : [form.address, form.city, form.landmark].filter((part) => part && part.trim()).join(', ');

    try {
      const order = await api('/orders', {
        method: 'POST',
        body: {
          customer_name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          delivery_address: deliveryAddress,
          delivery_type: form.deliveryType,
          delivery_zone: form.deliveryType === 'pickup' ? 'pickup' : form.zone,
          // Sent for the record only: the server works out the fee itself.
          shipping_cost: shipping,
          // The website stores the payment method in notes; keep the same shape.
          notes: [form.payment, form.notes.trim()].filter(Boolean).join(' — '),
          items: cart.items.map((i) => ({ product_id: i.id, quantity: i.quantity, price: i.price })),
        },
      });
      // The server prices the order itself; charge exactly what it says.
      const charged = Number(order.total) || total;
      history.addOrder({ token: order.token, orderId: order.orderId, total: charged, placedAt: Date.now() });
      cart.clear();
      if (form.payment === 'mpesa') nav.reset('pay', { orderId: order.orderId, token: order.token, amount: charged, phone: form.phone });
      else nav.reset('track', { token: order.token, fresh: true });
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <Screen title="Checkout" onBack={nav.back}>
        <Notice>Your cart is empty.</Notice>
      </Screen>
    );
  }

  return (
    <Screen title="Checkout" onBack={nav.back}>
      <div className="stack">
        <div className="segmented" role="radiogroup" aria-label="Delivery or pickup">
          {[
            ['delivery', 'Delivery'],
            ['pickup', 'Pickup'],
          ].map(([value, label]) => (
            <button key={value} className={form.deliveryType === value ? 'seg-on' : ''} onClick={() => setForm((f) => ({ ...f, deliveryType: value }))} role="radio" aria-checked={form.deliveryType === value}>
              {label}
            </button>
          ))}
        </div>

        <Field label="Full name" error={errors.name}>
          <input className="input" value={form.name} onChange={set('name')} autoComplete="name" />
        </Field>
        <Field label="Phone number" error={errors.phone} hint="We call or text you about the order.">
          <input className="input" value={form.phone} onChange={set('phone')} type="tel" inputMode="tel" autoComplete="tel" placeholder="0712 345 678" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input className="input" value={form.email} onChange={set('email')} type="email" inputMode="email" autoComplete="email" />
        </Field>

        {form.deliveryType === 'delivery' ? (
          <>
            <Field label="Delivery area">
              <select className="input" value={form.zone} onChange={set('zone')}>
                <option value="nairobi">Within Nairobi · {ksh(fees.delivery_nairobi)}</option>
                <option value="outside_nairobi">Outside Nairobi · {ksh(fees.delivery_outside_nairobi)}</option>
              </select>
            </Field>
            <Field label="Street / building" error={errors.address}>
              <input className="input" value={form.address} onChange={set('address')} autoComplete="street-address" />
            </Field>
            <Field label="Town / estate" error={errors.city}>
              <input className="input" value={form.city} onChange={set('city')} />
            </Field>
            <Field label="Landmark (optional)">
              <input className="input" value={form.landmark} onChange={set('landmark')} placeholder="Near the stage, gate colour…" />
            </Field>
          </>
        ) : (
          <Notice>Collect from {PICKUP_ADDRESS}.</Notice>
        )}

        <Field label="Payment">
          <div className="segmented" role="radiogroup" aria-label="Payment method">
            {[
              ['mpesa', 'M-Pesa'],
              ['cod', form.deliveryType === 'pickup' ? 'Pay at pickup' : 'Cash on delivery'],
            ].map(([value, label]) => (
              <button key={value} className={form.payment === value ? 'seg-on' : ''} onClick={() => setForm((f) => ({ ...f, payment: value }))} role="radio" aria-checked={form.payment === value}>
                {label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Note for the pharmacist (optional)">
          <textarea className="input" value={form.notes} onChange={set('notes')} />
        </Field>

        <div className="card stack" style={{ gap: 6 }}>
          <div className="row between small"><span>Items ({cart.count})</span><span>{ksh(cart.subtotal)}</span></div>
          <div className="row between small"><span>{form.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}</span><span>{ksh(shipping)}</span></div>
          <div className="divider" />
          <div className="row between"><span className="h3">Total</span><span className="price">{ksh(total)}</span></div>
        </div>

        {failure ? <Notice tone="bad">{failure}</Notice> : null}
        <Button busy={busy} onClick={placeOrder}>
          {form.payment === 'mpesa' ? `Place order & pay ${ksh(total)}` : `Place order · ${ksh(total)}`}
        </Button>
      </div>
    </Screen>
  );
}
