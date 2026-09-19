import { useState, type FormEvent, type ReactNode } from 'react';
import { LockKeyhole } from 'lucide-react';
import { AUTH_SESSION_KEY, credentialsAreValid } from '../utils/auth';

export function LoginGate({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(AUTH_SESSION_KEY) === 'true');
  const [error, setError] = useState('');

  if (authenticated) return children;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!credentialsAreValid(String(data.get('username')), String(data.get('password')))) {
      setError('Username or password is incorrect.');
      return;
    }
    sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
    setAuthenticated(true);
  };

  return (
    <main className="login-screen">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand"><img src="/mfx-logo.png" alt="MFx"/><span>PRIVATE WORKSPACE</span></div>
        <div className="login-intro"><LockKeyhole aria-hidden="true"/><div><p>Secure access</p><h1 id="login-title">MFx Workspace</h1></div></div>
        <form onSubmit={submit} className="login-form">
          <label>Username<input name="username" autoComplete="username" required autoFocus /></label>
          <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
          {error && <p role="alert" className="login-error">{error}</p>}
          <button className="primary-button" type="submit">Enter workspace</button>
        </form>
      </section>
    </main>
  );
}
