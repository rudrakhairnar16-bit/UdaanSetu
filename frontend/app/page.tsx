'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './lib/auth';

function LoginForm() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('admin@udaansetu.gov.in');
  const [password, setPassword] = useState('Admin@123');
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
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#fef7e8' }}>
        <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.1fr 1fr',
      background: 'var(--surface-soft)',
    }}>
      {/* Left brand panel */}
      <div style={{
        background: 'linear-gradient(160deg, #012348 0%, #011a38 55%, #013158 100%)',
        color: 'white',
        padding: '56px 48px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(600px 400px at 80% 20%, rgba(243,174,57,.14), transparent 60%)', pointerEvents: 'none' }} />
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)' }}>↗ UdaanSetu</div>
          <div style={{ fontSize: 12, color: '#92eaFF', marginTop: 4, fontWeight: 500 }}>SIH26136 · Govt of Maharashtra</div>
        </div>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em', fontFamily: 'var(--font-display)', maxWidth: 480 }}>
            Startup-Friendly Public Procurement
          </div>
          <div style={{ marginTop: 16, fontSize: 14, color: '#b0f0ff', lineHeight: 1.8, maxWidth: 440 }}>
            A platform enabling government departments to identify, pilot, procure and scale innovative solutions from eligible startups — with complete auditability and transparency.
          </div>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '🔍', label: 'Identify', desc: 'Government challenges' },
              { icon: '🚀', label: 'Pilot', desc: 'Milestone-based execution' },
              { icon: '✅', label: 'Validate', desc: 'Independent assessment' },
              { icon: '📋', label: 'Procure', desc: 'Auditable decisions' },
            ].map(f => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#e0f7ff', padding: '6px 8px', background: 'rgba(255,255,255,.05)', borderRadius: 8 }}>
                <span style={{ fontSize: 16 }}>{f.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{f.label}</div>
                  <div style={{ fontSize: 10, color: '#92eaFF' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: '#6adbff', opacity: .7, position: 'relative' }}>
          Government Innovation Procurement & Startup Pilot Platform
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 'min(400px, 100%)' }}>
          <div style={{ fontSize: 11, letterSpacing: '.14em', color: 'var(--green-600)', fontWeight: 700, marginBottom: 10 }}>
            WELCOME BACK
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, color: 'var(--gray-900)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Sign in to UdaanSetu
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 28 }}>
            Enter your credentials to access the workspace.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
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
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', display: 'block', marginBottom: 6 }}>
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
              <div style={{ background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 8, padding: '10px 14px', color: 'var(--red-700)', fontSize: 13 }}>
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

          <div style={{ marginTop: 24, padding: 14, background: 'var(--gray-100)', borderRadius: 10, fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--gray-900)' }}>Demo Credentials:</strong>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 16px', marginTop: 4 }}>
              <span>Admin · admin@udaansetu.gov.in</span>
              <span>Govt Officer · rajesh.patil@maharashtra.gov.in</span>
              <span>Procurement · meera.sharma@maharashtra.gov.in</span>
              <span>Evaluator · vikram.patil@ieee.org</span>
              <span>Validator · anjali.kulkarni@ncssc.in</span>
              <span>Auditor · suresh.jogani@cag.gov.in</span>
            </div>
            <div style={{ marginTop: 6, color: 'var(--gray-500)' }}>
              Admin: <strong>Admin@123</strong> · Govt: <strong>Govt@123</strong> · Procurement: <strong>Procure@123</strong><br/>
              Evaluator: <strong>Eval@123</strong> · Validator: <strong>Valid@123</strong> · Auditor: <strong>Audit@123</strong>
            </div>
          </div>

          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--gray-500)', textAlign: 'center' }}>
            New here? <Link href="/register" style={{ color: 'var(--green-600)', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return <LoginForm />;
}