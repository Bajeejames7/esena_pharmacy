import { useMemo, useState } from 'react';
import { api } from '@shared/api';
import { dateOnly, isEmail, isPhone } from '@shared/format';
import { Badge, Button, Field, Loading, Notice, Screen, useLoad, useNav } from '@shared/ui';
import { customer, history } from '../store';

/** Matches VALID_SERVICES in backend/controllers/appointmentController.js (legacy values left out). */
const SERVICES = [
  'Pharmacist Consultation', 'Doctor Consultation', 'Online Consultation', 'Dermatology', 'Nutrition and Wellness',
  'Eye Care', 'Laboratory Tests', 'Blood Tests', 'Malaria Testing', 'HIV Testing Support', 'Cholesterol Testing',
  'Vaccinations', 'Family Planning', 'Full Health Screening', 'Blood Pressure Check', 'Blood Glucose Testing',
  'BMI Measurement', 'Diabetes Management', 'Heart Health Consultation', 'Weight Management', 'Ear Piercing',
];

/** The same slots the website offers (BookAppointment.js), lunch break included. */
const SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];

export function Services() {
  const nav = useNav();
  const items = [
    ['📅', 'Book an appointment', 'Consultations, tests, vaccinations', 'book'],
    ['📄', 'Upload a prescription', 'Send a photo; we prepare it for you', 'prescription'],
    ['💬', 'Contact the pharmacy', 'Questions, stock requests, feedback', 'contact'],
  ];
  return (
    <Screen title="Services">
      <div className="stack">
        {items.map(([icon, title, sub, screen]) => (
          <button key={screen} className="list-item" onClick={() => nav.push(screen)}>
            <span style={{ fontSize: 26 }}>{icon}</span>
            <span style={{ flex: 1 }}>
              <span className="h3">{title}</span>
              <br />
              <span className="small muted">{sub}</span>
            </span>
            <span className="muted">›</span>
          </button>
        ))}
        <div className="card small muted">
          Esena Pharmacy · Outering Road, behind Eastmart Supermarket, Ruaraka, Nairobi.
          <br />
          <a href="tel:0768103599" className="link">Call 0768 103 599</a> · <a href="https://wa.me/254768103599" className="link">WhatsApp</a> · Emergencies: 999 / 112
        </div>
      </div>
    </Screen>
  );
}

function useContactForm() {
  const saved = customer.get();
  const [form, setForm] = useState({ name: saved.name, email: saved.email, phone: saved.phone, message: '' });
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  return [form, setForm, set];
}

function tomorrow() {
  const d = new Date(Date.now() + 86_400_000);
  return d.toISOString().slice(0, 10);
}

export function Book() {
  const nav = useNav();
  const [form, , set] = useContactForm();
  const [service, setService] = useState(SERVICES[0]);
  const [date, setDate] = useState(tomorrow());
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState(null);
  const availability = useLoad(() => api(`/appointments/availability?date=${date}`), [date]);
  const booked = useMemo(() => new Set((availability.data?.bookedTimes || []).map((t) => String(t).slice(0, 5))), [availability.data]);

  async function submit() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name.';
    if (!isEmail(form.email)) e.email = 'Enter a valid email.';
    if (!isPhone(form.phone)) e.phone = 'Enter a phone number (10–15 digits).';
    if (!time) e.time = 'Pick a time.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setFailure(null);
    customer.save({ ...customer.get(), name: form.name, email: form.email, phone: form.phone });
    try {
      const res = await api('/appointments', {
        method: 'POST',
        body: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), service, date: `${date}T${time}:00`, message: form.message.trim() },
      });
      const token = res.token ?? res.appointment?.token;
      if (token) history.addAppointment({ token, service, when: `${dateOnly(date)} at ${time}` });
      nav.reset('appointment', { token, fresh: true });
    } catch (err) {
      setFailure(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Book an appointment" onBack={nav.back}>
      <div className="stack">
        <Field label="Service">
          <select className="input" value={service} onChange={(e) => setService(e.target.value)}>
            {SERVICES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Date">
          <input className="input" type="date" value={date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => { setDate(e.target.value); setTime(''); }} />
        </Field>
        <Field label="Time" error={errors.time}>
          {availability.loading ? <Loading label="Checking free times…" /> : (
            <div className="slots">
              {SLOTS.map((slot) => (
                <button key={slot} disabled={booked.has(slot)} className={`chip ${time === slot ? 'chip-on' : ''}`} onClick={() => setTime(slot)}>
                  {slot}
                </button>
              ))}
            </div>
          )}
        </Field>
        <Field label="Full name" error={errors.name}><input className="input" value={form.name} onChange={set('name')} /></Field>
        <Field label="Phone number" error={errors.phone}><input className="input" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} /></Field>
        <Field label="Email" error={errors.email}><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Anything we should know? (optional)"><textarea className="input" value={form.message} onChange={set('message')} /></Field>
        {failure ? <Notice tone="bad">{failure}</Notice> : null}
        <Button busy={busy} onClick={submit}>Book {time ? `for ${time}` : ''}</Button>
      </div>
    </Screen>
  );
}

export function Appointment({ token, fresh }) {
  const nav = useNav();
  const { data, error, loading, reload } = useLoad(() => api(`/appointments/${encodeURIComponent(token)}`), [token]);
  return (
    <Screen title="Appointment" onBack={fresh ? () => nav.reset('orders') : nav.back}>
      {loading ? <Loading /> : null}
      {error ? <Notice tone="bad">{error.message}</Notice> : null}
      {data ? (
        <div className="stack">
          {fresh ? <Notice tone="good">Booked. We will confirm by email or phone.</Notice> : null}
          <div className="card stack" style={{ gap: 8 }}>
            <div className="row between"><span className="h3">{data.service}</span><Badge status={data.status} /></div>
            <dl className="kv">
              <dt>Date</dt><dd>{dateOnly(data.date)}</dd>
              <dt>Time</dt><dd>{String(data.time || '').slice(0, 5) || '—'}</dd>
              <dt>Name</dt><dd>{data.name}</dd>
              <dt>Code</dt><dd><strong>{data.token}</strong></dd>
            </dl>
          </div>
          <Button variant="ghost" onClick={reload}>Refresh status</Button>
        </div>
      ) : null}
    </Screen>
  );
}

export function Prescription() {
  const nav = useNav();
  const [form, , set] = useContactForm();
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function submit() {
    const e = {};
    if (!file) e.file = 'Take a photo of the prescription or choose a file.';
    else if (file.size > 5 * 1024 * 1024) e.file = 'That file is over 5 MB. Take a smaller photo.';
    if (form.name.trim().length < 2) e.name = 'Enter your name.';
    if (!isPhone(form.phone)) e.phone = 'Enter a phone number (10–15 digits).';
    if (form.email && !isEmail(form.email)) e.email = 'That email does not look right.';
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setResult(null);
    const data = new FormData();
    data.append('prescription', file);
    data.append('name', form.name.trim());
    data.append('phone', form.phone.trim());
    data.append('email', form.email.trim());
    data.append('message', form.message.trim());
    try {
      await api('/prescriptions/upload', { method: 'POST', form: data, timeoutMs: 60000 });
      setResult({ ok: true });
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Upload a prescription" onBack={nav.back}>
      <div className="stack">
        {result?.ok ? (
          <>
            <Notice tone="good">Received. A pharmacist will review it and call you on {form.phone} with the price.</Notice>
            <Button onClick={() => nav.reset('shop')}>Back to the shop</Button>
          </>
        ) : (
          <>
            <Field label="Prescription" error={errors.file} hint="A clear photo of the whole page, or a PDF. Up to 5 MB.">
              <input className="input" type="file" accept="image/*,application/pdf" capture="environment" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Field>
            <Field label="Full name" error={errors.name}><input className="input" value={form.name} onChange={set('name')} /></Field>
            <Field label="Phone number" error={errors.phone}><input className="input" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} /></Field>
            <Field label="Email (optional)" error={errors.email}><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
            <Field label="Note (optional)"><textarea className="input" value={form.message} onChange={set('message')} placeholder="Delivery or pickup, allergies…" /></Field>
            {result && !result.ok ? <Notice tone="bad">{result.message}</Notice> : null}
            <Button busy={busy} onClick={submit}>Send prescription</Button>
          </>
        )}
      </div>
    </Screen>
  );
}

export function Contact({ subject: initialSubject }) {
  const nav = useNav();
  const [form, , set] = useContactForm();
  const [subject, setSubject] = useState(initialSubject || '');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function submit() {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your name.';
    if (!isEmail(form.email)) e.email = 'Enter a valid email.';
    if (!isPhone(form.phone)) e.phone = 'Enter a phone number (10–15 digits).';
    if (form.message.trim().length === 0) e.message = 'Write your message.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      await api('/contact', { method: 'POST', body: { name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), subject: subject.trim() || 'General Enquiry', message: form.message.trim() } });
      setResult({ ok: true });
    } catch (err) {
      setResult({ ok: false, message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen title="Contact us" onBack={nav.back}>
      <div className="stack">
        {result?.ok ? (
          <>
            <Notice tone="good">Message sent. We usually reply within a day.</Notice>
            <Button onClick={() => nav.back()}>Done</Button>
          </>
        ) : (
          <>
            <Field label="Full name" error={errors.name}><input className="input" value={form.name} onChange={set('name')} /></Field>
            <Field label="Phone number" error={errors.phone}><input className="input" type="tel" inputMode="tel" value={form.phone} onChange={set('phone')} /></Field>
            <Field label="Email" error={errors.email}><input className="input" type="email" value={form.email} onChange={set('email')} /></Field>
            <Field label="Subject"><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} /></Field>
            <Field label="Message" error={errors.message}><textarea className="input" value={form.message} onChange={set('message')} /></Field>
            {result && !result.ok ? <Notice tone="bad">{result.message}</Notice> : null}
            <Button busy={busy} onClick={submit}>Send</Button>
          </>
        )}
      </div>
    </Screen>
  );
}
