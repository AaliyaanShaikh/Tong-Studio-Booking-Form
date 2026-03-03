import { useState, type FC, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const INPUT_CLASS =
  'rounded-xl border-2 border-stone-200 font-sans px-5 py-4 focus:outline-none focus:ring-2 focus:ring-champagne-400 focus:border-transparent w-full';

const LoginPage: FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(username, password);
    setSubmitting(false);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error ?? 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-alabaster flex items-center justify-center px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl text-charcoal-900 mb-2">Admin login</h1>
        <p className="font-sans text-stone-500 text-sm mb-8">Tong Studio booking admin</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-xl bg-red-50 border border-red-200 text-red-700 font-sans text-sm px-4 py-3">
              {error}
            </p>
          )}
          <div>
            <label htmlFor="username" className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={INPUT_CLASS}
              placeholder="admin"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-sans text-xs font-semibold text-charcoal-800 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={INPUT_CLASS}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-full bg-charcoal-900 text-white font-sans text-sm font-bold uppercase tracking-[0.2em] hover:bg-charcoal-800 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="font-sans text-stone-400 text-xs mt-6 text-center">
          <Link to="/" className="hover:text-champagne-600 transition-colors">← Back to booking</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
