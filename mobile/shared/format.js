/** Formatting shared by both apps, so a price or a status reads the same everywhere. */

export function ksh(value) {
  const n = Number(value) || 0;
  return `KSh ${n.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

export function dateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('en-KE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function dateOnly(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

/** Order, appointment and prescription statuses, in words. Matches the backend's validStatuses. */
export const STATUS_LABELS = {
  pending: 'Pending',
  payment_requested: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  dispatched: 'Dispatched',
  ready_for_pickup: 'Ready for pickup',
  completed: 'Completed',
  cancelled: 'Cancelled',
  confirmed: 'Confirmed',
  no_show: 'No show',
  reviewed: 'Reviewed',
};

export function statusLabel(status) {
  return STATUS_LABELS[status] || String(status || '—').replace(/_/g, ' ');
}

/** A tone for a status badge. Always shown with the words, never colour alone. */
export function statusTone(status) {
  if (['completed', 'paid', 'confirmed'].includes(status)) return 'good';
  if (['cancelled', 'no_show'].includes(status)) return 'bad';
  if (['dispatched', 'ready_for_pickup', 'reviewed', 'processing'].includes(status)) return 'info';
  return 'warn';
}

/** Kenyan phone numbers, loosely: 10–15 digits, same rule the contact form uses on the server. */
export function isPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}
