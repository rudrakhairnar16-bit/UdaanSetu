'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './lib/auth';

function LoginForm() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@udaansetu.demo');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#f0fdf4' }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      background: '#f9fafb',
    }}>
      {/* Left brand panel */}
      <div style={{
        background: 'linear-gradient(160deg, #064e3b 0%, #0c3b26 55%, #14532d 100%)',
        color: 'white',
        padding: '56px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 400px at 80% 20%, rgba(74,222,128,.14), transparent 60%)', pointerEvents: 'none' }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>↗ UdaanSetu</div>
          <div style={{ fontSize: 12, color: '#86efac', marginTop: 4, fontWeight: 500 }}>SIH1608 · Prototype</div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', maxWidth: 480 }}>
            Turn research into<br />enduring impact.
          </div>
          <div style={{ marginTop: 20, fontSize: 15, color: '#a7f3d0', lineHeight: 1.7, maxWidth: 440 }}>
            One platform connecting research, innovation, IPR, startups and
            ecosystem support — from lab bench to market.
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['🔬 Research', '💡 Innovation', '🚀 Startup', '🌍 Impact'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#ecfdf5' }}>
                <span style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{f.split(' ')[0]}</span>
                {f.split(' ')[1]}
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#6ee7b7', opacity: .7, position: 'relative' }}>
          Demo prototype — all data is representative, not government data.
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 'min(400px, 100%)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.14em', color: '#16a34a', fontWeight: 700, marginBottom: 10 }}>
            WELCOME BACK
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, color: '#111827', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Sign in to UdaanSetu
          </h1>
          <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 28 }}>
            Enter your credentials to access the workspace.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="username"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ width: '100%' }}
              />
            </div>
            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#991b1b', fontSize: 13 }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
            >
              {submitting ? 'Signing in...' : 'Enter demo workspace'}
            </button>
          </form>

          <div style={{ marginTop: 24, padding: 14, background: '#f3f4f6', borderRadius: 10, fontSize: 12, color: '#4b5563', lineHeight: 1.7 }}>
            <strong style={{ color: '#111827' }}>Demo Credentials:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: 4 }}>
              <span>Admin · admin@udaansetu.demo</span>
              <span>Researcher · researcher@udaansetu.demo</span>
              <span>Mentor · mentor@udaansetu.demo</span>
              <span>Investor · investor@udaansetu.demo</span>
              <span>Incubator · incubator@udaansetu.demo</span>
            </div>
            <div style={{ marginTop: 6, color: '#6b7280' }}>Password for all: <strong>Demo@123</strong></div>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
            New here? <Link href="/register" style={{ color: '#16a34a', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <LoginForm />;
}