import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { statusLabel, statusTone } from './format';

/**
 * A small screen stack, instead of a router.
 *
 * A phone app navigates by pushing a screen and going back, and the Android
 * back button has to do the same thing. A URL router models neither well, so
 * each app keeps a stack of { name, params } and renders the top one.
 */
const NavContext = createContext(null);

export function NavProvider({ initial, children }) {
  const [stack, setStack] = useState([initial]);

  const push = useCallback((name, params = {}) => setStack((s) => [...s, { name, params }]), []);
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  /** Replace the whole stack: switching tabs, or finishing a flow. */
  const reset = useCallback((name, params = {}) => setStack([{ name, params }]), []);

  // The Android hardware back button pops a screen, and only leaves the app from the root.
  useEffect(() => {
    let handle;
    let cancelled = false;
    import('@capacitor/app')
      .then(({ App }) =>
        App.addListener('backButton', () => {
          setStack((s) => {
            if (s.length > 1) return s.slice(0, -1);
            App.exitApp();
            return s;
          });
        }),
      )
      .then((h) => {
        if (cancelled) h?.remove();
        else handle = h;
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      handle?.remove();
    };
  }, []);

  const value = useMemo(() => ({ stack, top: stack[stack.length - 1], push, back, reset }), [stack, push, back, reset]);
  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav() {
  return useContext(NavContext);
}

export function Screen({ title, onBack, action, children }) {
  return (
    <div className="screen">
      <header className="bar">
        {onBack ? (
          <button className="bar-back" onClick={onBack} aria-label="Back">
            ‹
          </button>
        ) : (
          <span className="bar-spacer" />
        )}
        <h1 className="bar-title">{title}</h1>
        <div className="bar-action">{action}</div>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}

export function Button({ children, variant = 'primary', busy = false, disabled, ...rest }) {
  return (
    <button className={`btn btn-${variant}`} disabled={disabled || busy} {...rest}>
      {busy ? <span className="spinner" aria-hidden="true" /> : null}
      <span>{children}</span>
    </button>
  );
}

export function Field({ label, error, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && !error ? <span className="field-hint">{hint}</span> : null}
      {error ? (
        <span className="field-error" role="alert">
          ⚠ {error}
        </span>
      ) : null}
    </label>
  );
}

export function Badge({ status, children }) {
  return <span className={`badge badge-${statusTone(status)}`}>{children ?? statusLabel(status)}</span>;
}

export function Notice({ tone = 'info', children }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === 'bad' ? 'alert' : 'status'}>
      {children}
    </div>
  );
}

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="loading">
      <span className="spinner" aria-hidden="true" /> {label}
    </div>
  );
}

export function Empty({ title, children }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children ? <p className="empty-body">{children}</p> : null}
    </div>
  );
}

export function TabBar({ tabs, current, onSelect }) {
  return (
    <nav className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          className={`tab ${current === tab.name ? 'tab-on' : ''}`}
          onClick={() => onSelect(tab.name)}
          aria-current={current === tab.name ? 'page' : undefined}
        >
          <span className="tab-icon" aria-hidden="true">
            {tab.icon}
          </span>
          <span className="tab-label">{tab.label}</span>
          {tab.count ? <span className="tab-count">{tab.count}</span> : null}
        </button>
      ))}
    </nav>
  );
}

/** Run an async loader; expose { data, error, loading, reload }. */
export function useLoad(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let live = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader()
      .then((data) => live && setState({ data, error: null, loading: false }))
      .catch((error) => live && setState({ data: null, error, loading: false }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}
