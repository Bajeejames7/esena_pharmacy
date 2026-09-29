/**
 * The Esena API, as the mobile apps see it.
 *
 * Both apps talk to the same live backend the website uses. Inside the
 * Android app, Capacitor's native HTTP layer (CapacitorHttp, enabled in each
 * app's capacitor.config.json) carries every fetch() — so the API's CORS
 * whitelist, which only knows the website's origins, does not apply, and no
 * backend change was needed to support the apps.
 *
 * Override the base URL for local development with VITE_API_URL
 * (e.g. http://10.0.2.2:5000/api from an Android emulator).
 */

export const API_URL = (import.meta.env.VITE_API_URL || 'https://api.esena.co.ke/api').replace(/\/$/, '');

/** Where the website serves its own static images ("/placeholder_product.webp"). */
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://esena.co.ke').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

/** The clearest sentence the server gave us, or a plain fallback. */
function messageFrom(body, status) {
  if (body && typeof body === 'object') {
    if (Array.isArray(body.errors) && body.errors.length) return body.errors.join(' ');
    if (body.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors).find(Boolean);
      if (first) return String(first);
    }
    if (body.message) return String(body.message);
    if (body.error) return String(body.error);
  }
  if (status === 0) return 'No connection. Check your internet and try again.';
  if (status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
  if (status >= 500) return 'The server had a problem. Please try again shortly.';
  return 'Something went wrong. Please try again.';
}

/**
 * One request. Resolves with the parsed body; rejects with an ApiError whose
 * message is safe to show a customer.
 *
 * @param {string} path  e.g. "/products?limit=20"
 * @param {{ method?: string, body?: unknown, form?: FormData, token?: string|null, timeoutMs?: number, raw?: boolean }} options
 */
export async function api(path, options = {}) {
  const { method = 'GET', body, form, token, timeoutMs = 20000, raw = false } = options;
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (error) {
    throw new ApiError(
      error?.name === 'AbortError'
        ? 'The server took too long to answer. Please try again.'
        : messageFrom(null, 0),
      0,
    );
  } finally {
    clearTimeout(timer);
  }

  if (raw && response.ok) return response;

  const text = await response.text();
  let parsed = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }
  if (!response.ok) throw new ApiError(messageFrom(parsed, response.status), response.status, parsed);
  return parsed;
}

/** A product's image URL, resolved the same way the website's ProductCard does. */
export function productImage(image) {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  if (image.startsWith('/')) return `${SITE_URL}${image}`;
  return `${API_URL}/uploads/products/${image}`;
}
