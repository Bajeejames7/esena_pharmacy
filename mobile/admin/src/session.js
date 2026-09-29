import { useCallback, useEffect, useState } from 'react';
import { ApiError, api } from '@shared/api';

/**
 * The staff session: the same JWT the website's admin panel stores as
 * `adminToken`, kept on this phone and attached to every admin request.
 *
 * Signing out on a 401 only when the token has actually expired mirrors the
 * website's rule: a transient 401 during a Render cold start must not throw a
 * pharmacist out of the order they are working on.
 */

const TOKEN = 'esena.admin.token';
const USER = 'esena.admin.user';
const listeners = new Set();

function read() {
  try {
    const token = localStorage.getItem(TOKEN);
    const user = JSON.parse(localStorage.getItem(USER) || 'null');
    return token ? { token, user } : null;
  } catch {
    return null;
  }
}

let current = read();

function publish(next) {
  current = next;
  try {
    if (next) {
      localStorage.setItem(TOKEN, next.token);
      localStorage.setItem(USER, JSON.stringify(next.user));
    } else {
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(USER);
    }
  } catch {
    // Storage blocked: the session still lasts until the app closes.
  }
  listeners.forEach((fn) => fn(next));
}

export function tokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export function useSession() {
  const [session, setSession] = useState(current);
  useEffect(() => {
    listeners.add(setSession);
    if (current && tokenExpired(current.token)) publish(null);
    return () => listeners.delete(setSession);
  }, []);

  const signIn = useCallback((token, user) => publish({ token, user }), []);
  const signOut = useCallback(() => {
    const token = current?.token;
    publish(null);
    if (token) api('/auth/logout', { method: 'POST', token }).catch(() => {});
  }, []);
  return { session, signIn, signOut };
}

/** An authenticated request. Signs out only when the token itself is dead. */
export async function adminApi(path, options = {}) {
  const token = current?.token;
  try {
    return await api(path, { ...options, token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && (!token || tokenExpired(token))) publish(null);
    throw error;
  }
}
