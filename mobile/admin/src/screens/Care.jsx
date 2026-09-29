import { useEffect, useMemo, useState } from 'react';
import { dateOnly, dateTime, statusLabel } from '@shared/format';
import { Badge, Button, Empty, Loading, Notice, Screen, useLoad, useNav } from '@shared/ui';
import { adminApi } from '../session';

// ---------------------------------------------------------------------------
// Appointments
// ---------------------------------------------------------------------------

const APPT_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show'];

export function Appointments() {
  const nav = useNav();
  const [filter, setFilter] = useState('upcoming');
  const { data, error, loading, reload } = useLoad(() => adminApi('/appointments?limit=300&sort=date&order=asc'), []);

  const list = useMemo(() => {
    const all = data?.appointments ?? [];
    const today = new Date().toISOString().slice(0, 10);
    if (filter === 'upcoming') return all.filter((a) => ['pending', 'confirmed'].includes(a.status) && String(a.date).slice(0, 10) >= today);
    if (filter === 'all') return all;
    return all.filter((a) => a.status === filter);
  }, [data, filter]);

  return (
    <Screen title="Appointments" action={<button onClick={reload}>Refresh</button>}>
      <div className="stack">
        <div className="chips">
          {[['upcoming', 'Upcoming'], ...APPT_STATUSES.map((s) => [s, statusLabel(s)]), ['all', 'All']].map(([value, label]) => (
            <button key={value} className={`chip ${filter === value ? 'chip-on' : ''}`} onClick={() => setFilter(value)}>{label}</button>
          ))}
        </div>
        {loading ? <Loading /> : null}
        {error ? <Notice tone="bad">{error.message}</Notice> : null}
        {!loading && list.length === 0 ? <Empty title="No appointments here" /> : null}
        {list.map((a) => (
          <button key={a.id} className="list-item" onClick={() => nav.push('appointment', { appointment: a })}>
            <span style={{ flex: 1 }}>
              <span className="row between"><span className="h3">{a.name}</span><Badge status={a.status} /></span>
              <span className="small muted">{a.service} · {dateOnly(a.date)}{a.time ? ` at ${String(a.time).slice(0, 5)}` : ''}</span>
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

export function Appointment({ appointment: initial }) {
  const nav = useNav();
  const [a, setA] = useState(initial);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);

  async function setStatus(status) {
    setBusy(status);
    setMessage(null);
    try {
      await adminApi(`/appointments/${a.id}/status`, { method: 'PUT', body: { status } });
      setA((prev) => ({ ...prev, status }));
      setMessage({ tone: 'good', text: `Marked ${statusLabel(status).toLowerCase()}. The customer is emailed where the website would email them.` });
    } catch (e) {
      setMessage({ tone: 'bad', text: e.message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen title="Appointment" onBack={nav.back}>
      <div className="stack">
        <div className="card stack" style={{ gap: 8 }}>
          <div className="row between"><span className="h3">{a.service}</span><Badge status={a.status} /></div>
          <dl className="kv">
            <dt>Name</dt><dd>{a.name}</dd>
            <dt>Phone</dt><dd><a className="link" href={`tel:${a.phone}`}>{a.phone}</a></dd>
            <dt>Email</dt><dd>{a.email}</dd>
            <dt>Date</dt><dd>{dateOnly(a.date)}</dd>
            <dt>Time</dt><dd>{String(a.time || '').slice(0, 5) || '—'}</dd>
            {a.message ? (<><dt>Note</dt><dd>{a.message}</dd></>) : null}
          </dl>
        </div>
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
        <div className="card stack">
          <span className="h3">Set status</span>
          {APPT_STATUSES.filter((s) => s !== a.status).map((s) => (
            <Button key={s} variant={s === 'cancelled' || s === 'no_show' ? 'danger' : 'navy'} busy={busy === s} disabled={Boolean(busy)} onClick={() => setStatus(s)}>
              {statusLabel(s)}
            </Button>
          ))}
        </div>
      </div>
    </Screen>
  );
}

// ---------------------------------------------------------------------------
// Prescriptions
// ---------------------------------------------------------------------------

const RX_STATUSES = ['pending', 'reviewed', 'completed', 'cancelled'];

export function Prescriptions() {
  const nav = useNav();
  const [filter, setFilter] = useState('pending');
  const { data, error, loading, reload } = useLoad(() => adminApi('/prescriptions'), []);
  const list = (data?.data ?? []).filter((p) => filter === 'all' || p.status === filter);

  return (
    <Screen title="Prescriptions" action={<button onClick={reload}>Refresh</button>}>
      <div className="stack">
        <div className="chips">
          {[...RX_STATUSES, 'all'].map((s) => (
            <button key={s} className={`chip ${filter === s ? 'chip-on' : ''}`} onClick={() => setFilter(s)}>{s === 'all' ? 'All' : statusLabel(s)}</button>
          ))}
        </div>
        {loading ? <Loading /> : null}
        {error ? <Notice tone="bad">{error.message}</Notice> : null}
        {!loading && list.length === 0 ? <Empty title="Nothing here" /> : null}
        {list.map((p) => (
          <button key={p.id} className="list-item" onClick={() => nav.push('prescription', { prescription: p })}>
            <span style={{ fontSize: 24 }}>📄</span>
            <span style={{ flex: 1 }}>
              <span className="row between"><span className="h3">#{p.id} · {p.name}</span><Badge status={p.status} /></span>
              <span className="small muted">{dateTime(p.created_at)}</span>
            </span>
          </button>
        ))}
      </div>
    </Screen>
  );
}

/**
 * The file comes from the staff-only GET /prescriptions/:id/file: prescriptions
 * are patient data and are not public. Fetched with the token, shown from a
 * blob URL.
 */
function PrescriptionFile({ id, isPdf }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let objectUrl = null;
    let live = true;
    adminApi(`/prescriptions/${id}/file`, { raw: true, timeoutMs: 60000 })
      .then((res) => res.blob())
      .then((blob) => {
        if (!live) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (failed) return <Notice tone="bad">The prescription file could not be loaded.</Notice>;
  if (!url) return <Loading label="Loading file…" />;
  if (isPdf) {
    return (
      <a className="btn btn-navy" href={url} target="_blank" rel="noreferrer">
        Open PDF
      </a>
    );
  }
  return <img src={url} alt="Prescription" className="rx-image" />;
}

export function Prescription({ prescription: initial }) {
  const nav = useNav();
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);

  async function setStatus(status) {
    setBusy(status);
    setMessage(null);
    try {
      await adminApi(`/prescriptions/${p.id}/status`, { method: 'PATCH', body: { status } });
      setP((prev) => ({ ...prev, status }));
      setMessage({ tone: 'good', text: `Marked ${statusLabel(status).toLowerCase()}.` });
    } catch (e) {
      setMessage({ tone: 'bad', text: e.message });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Screen title={`Prescription #${p.id}`} onBack={nav.back}>
      <div className="stack">
        <div className="card stack" style={{ gap: 8 }}>
          <div className="row between"><span className="h3">{p.name}</span><Badge status={p.status} /></div>
          <dl className="kv">
            <dt>Phone</dt><dd><a className="link" href={`tel:${p.phone}`}>{p.phone}</a></dd>
            {p.email ? (<><dt>Email</dt><dd>{p.email}</dd></>) : null}
            <dt>Sent</dt><dd>{dateTime(p.created_at)}</dd>
            {p.message ? (<><dt>Note</dt><dd>{p.message}</dd></>) : null}
          </dl>
        </div>
        <div className="card">{p.file_path ? <PrescriptionFile id={p.id} isPdf={/\.pdf$/i.test(p.file_path)} /> : <p className="muted">No file attached.</p>}</div>
        {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}
        <div className="card stack">
          <span className="h3">Set status</span>
          {RX_STATUSES.filter((s) => s !== p.status).map((s) => (
            <Button key={s} variant={s === 'cancelled' ? 'danger' : 'navy'} busy={busy === s} disabled={Boolean(busy)} onClick={() => setStatus(s)}>
              {statusLabel(s)}
            </Button>
          ))}
          <p className="small muted">To turn this into an order with prices, use the website admin panel for now.</p>
        </div>
      </div>
    </Screen>
  );
}

