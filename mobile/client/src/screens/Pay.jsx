import { useEffect, useRef, useState } from 'react';
import { api } from '@shared/api';
import { isPhone, ksh } from '@shared/format';
import { Button, Field, Notice, Screen, useNav } from '@shared/ui';

/**
 * M-Pesa STK push through Kopo Kopo, exactly as the website does it:
 * POST /k2/stkpush, then poll /k2/status/:checkoutRequestId until the payment
 * leaves "pending". The server checks the amount against the order total.
 */

const POLL_MS = 4000;
const GIVE_UP_MS = 2.5 * 60 * 1000;
const PAID = ['success', 'successful', 'completed', 'paid'];
const FAILED = ['failed', 'cancelled', 'expired'];

export function Pay({ orderId, token, amount, phone: initialPhone }) {
  const nav = useNav();
  const [phone, setPhone] = useState(initialPhone || '');
  const [state, setState] = useState('idle'); // idle | sending | waiting | paid | failed
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function send() {
    if (!isPhone(phone)) {
      setMessage('Enter the M-Pesa number to charge.');
      return;
    }
    setState('sending');
    setMessage(null);
    try {
      const res = await api('/k2/stkpush', { method: 'POST', body: { orderId, phoneNumber: phone.trim(), amount: Math.round(amount) } });
      setState('waiting');
      poll(res.checkoutRequestId, Date.now());
    } catch (e) {
      setState('failed');
      setMessage(e.message);
    }
  }

  function poll(id, startedAt) {
    timer.current = setTimeout(async () => {
      try {
        const res = await api(`/k2/status/${encodeURIComponent(id)}`);
        const status = String(res.payment?.status || '').toLowerCase();
        if (PAID.includes(status)) {
          setState('paid');
          return;
        }
        if (FAILED.includes(status)) {
          setState('failed');
          setMessage(res.payment?.resultDescription || 'The payment did not go through.');
          return;
        }
      } catch {
        // A dropped poll is not a failed payment; keep waiting.
      }
      if (Date.now() - startedAt > GIVE_UP_MS) {
        setState('failed');
        setMessage('We did not hear back from M-Pesa. If you paid, it will show on your order shortly.');
        return;
      }
      poll(id, startedAt);
    }, POLL_MS);
  }

  return (
    <Screen title="Pay with M-Pesa">
      <div className="stack">
        <div className="card">
          <p className="small muted">Order #{orderId}</p>
          <p className="price big">{ksh(amount)}</p>
        </div>

        {state === 'paid' ? (
          <>
            <Notice tone="good">Payment received. Thank you! Your order is being prepared.</Notice>
            <Button onClick={() => nav.reset('track', { token, fresh: true })}>View my order</Button>
          </>
        ) : (
          <>
            <Field label="M-Pesa number" hint="You will get a prompt on this phone to enter your M-Pesa PIN.">
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" disabled={state === 'waiting' || state === 'sending'} />
            </Field>
            {state === 'waiting' ? <Notice>Check your phone and enter your M-Pesa PIN. Waiting for confirmation…</Notice> : null}
            {message ? <Notice tone={state === 'failed' ? 'bad' : 'warn'}>{message}</Notice> : null}
            <Button busy={state === 'sending' || state === 'waiting'} onClick={send}>
              {state === 'failed' ? 'Try again' : `Send M-Pesa prompt`}
            </Button>
            <Button variant="ghost" onClick={() => nav.reset('track', { token, fresh: true })}>
              Pay later — view my order
            </Button>
          </>
        )}
      </div>
    </Screen>
  );
}
