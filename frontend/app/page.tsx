'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from './lib/auth';

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
      placeItems: 'center',
      background: 'radial-gradient(ellipse at 70% 30%, #bbf7d0, #f0fdf4 50%, #f9fafb)',
      padding: 20,
    }}>
      <div style={{
        width: 'min(440px, 100%)',
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: 20,
        padding: '44px 36px',
        boxShadow: '0 20px 60px rgba(20,67,42,.08)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 4 }}>↗</div>
        <div style={{ fontSize: 11, letterSpacing: '.15em', color: '#16a34a', fontWeight: 700, marginBottom: 8 }}>
          SIH1608 PROTOTYPE
        </div>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 6, color: '#14532d' }}>UdaanSetu</h1>
        <p style={{ color: '#6b7280', fontSize: 15, marginBottom: 28 }}>
          Turn research into enduring impact.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#4b5563', display: 'block', marginBottom: 4 }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
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
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15, marginTop: 4 }}
          >
            {submitting ? 'Signing in...' : 'Enter demo workspace'}
          </button>
        </form>

        <div style={{ marginTop: 20, padding: 14, background: '#f9fafb', borderRadius: 8, fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
          <strong style={{ color: '#374151' }}>Demo Credentials:</strong><br />
          Admin: admin@udaansetu.demo / Demo@123<br />
          Researcher: researcher@udaansetu.demo / Demo@123<br />
          Mentor: mentor@udaansetu.demo / Demo@123<br />
          Investor: investor@udaansetu.demo / Demo@123<br />
          Incubator: incubator@udaansetu.demo / Demo@123
        </div>

        <p style={{ marginTop: 16, fontSize: 11, color: '#9ca3af', textAlign: 'center' }}>
          All data is DEMO DATA. Not government data.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
