'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';

export default function RegisterPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'researcher', district: '', organization: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(form.password)) { setError('Password must contain an uppercase letter'); return; }
    if (!/[a-z]/.test(form.password)) { setError('Password must contain a lowercase letter'); return; }
    if (!/[0-9]/.test(form.password)) { setError('Password must contain a digit'); return; }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/auth/register', form);
      await login(form.email, form.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(ellipse at 70% 30%, #bbf7d0, var(--green-50) 50%, var(--surface-soft))', padding: 20 }}>
      <div style={{ width: 'min(480px, 100%)', background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 20, padding: '44px 36px', boxShadow: '0 20px 60px rgba(20,67,42,.08)' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, color: 'var(--green-900)' }}>Create Account</h1>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>Join the UdaanSetu innovation ecosystem</p>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
          <div className="form-group">
            <label>Full Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password *</label>
            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 digit" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="researcher">Researcher</option>
                <option value="mentor">Mentor</option>
                <option value="investor">Investor</option>
                <option value="incubator">Incubator</option>
              </select>
            </div>
            <div className="form-group">
              <label>District</label>
              <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="City" />
            </div>
          </div>
          <div className="form-group">
            <label>Organization</label>
            <input value={form.organization} onChange={e => setForm({ ...form, organization: e.target.value })} placeholder="University / Company" />
          </div>

          {error && <div style={{ background: 'var(--red-50)', border: '1px solid var(--red-100)', borderRadius: 8, padding: '10px 14px', color: 'var(--red-700)', fontSize: 13 }}>{error}</div>}

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: 13, fontSize: 15 }}>
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 13, color: 'var(--gray-500)', textAlign: 'center' }}>
          Already have an account? <Link href="/" style={{ color: '#d4880f', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
