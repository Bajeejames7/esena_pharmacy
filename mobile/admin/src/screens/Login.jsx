import { useState } from 'react';
import { api } from '@shared/api';
import { Button, Field, Notice } from '@shared/ui';

/** POST /auth/login; a second step for the 2FA code when the account has it on. */
export function Login({ onSignedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [needsCode, setNeedsCode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { username: username.trim(), password };
      if (needsCode) body.two_fa_code = code.trim();
      const res = await api('/auth/login', { method: 'POST', body });
      if (res?.requires2FA) {
        setNeedsCode(true);
        return;
      }
      if (!res?.token) throw new Error('The server did not return a session.');
      onSignedIn(res.token, res.user);
    } catch (err) {
      setError(err.status === 401 ? 'Wrong username or password.' : err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login">
      <div className="login-brand">
        <img src="/logo.png" alt="" width="72" height="72" />
        <h1>Esena Admin</h1>
        <p>Orders, appointments, prescriptions and stock.</p>
      </div>
      <form className="card stack" onSubmit={submit}>
        {!needsCode ? (
          <>
            <Field label="Username or email">
              <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoCapitalize="none" autoComplete="username" />
            </Field>
            <Field label="Password">
              <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </Field>
          </>
        ) : (
          <Field label="Authenticator code" hint="The 6-digit code from your authenticator app.">
            <input className="input" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={8} autoFocus />
          </Field>
        )}
        {error ? <Notice tone="bad">{error}</Notice> : null}
        <Button type="submit" variant="navy" busy={busy} disabled={!username || !password || (needsCode && code.trim().length < 6)}>
          {needsCode ? 'Verify' : 'Sign in'}
        </Button>
        {needsCode ? (
          <Button type="button" variant="ghost" onClick={() => { setNeedsCode(false); setCode(''); }}>
            Back
          </Button>
        ) : null}
      </form>
    </div>
  );
}
