'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn, GUJARAT_DISTRICTS } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'researcher', district: '', organization: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(form.password)) { setError('Must contain uppercase letter'); return; }
    if (!/[a-z]/.test(form.password)) { setError('Must contain lowercase letter'); return; }
    if (!/[0-9]/.test(form.password)) { setError('Must contain a digit'); return; }
    setLoading(true); setError('');
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const res = await fetch(`${backendUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          district: form.district || undefined,
          organization: form.organization || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
        throw new Error(err.detail || 'Registration failed');
      }
      const data = await res.json();
      localStorage.setItem('auth_token', data.access_token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gujarat-50 via-white to-gujarat-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gujarat-600">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join the Gujarat Innovation Ecosystem</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Full Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Your full name" /></div>
            <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="you@example.com" autoComplete="username" /></div>
            <div className="space-y-2"><Label>Password *</Label><Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 digit" autoComplete="new-password" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Role</Label><Select value={form.role} onValueChange={v => setForm({...form, role: v})}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="researcher">Researcher</SelectItem><SelectItem value="mentor">Mentor</SelectItem><SelectItem value="investor">Investor</SelectItem><SelectItem value="incubator">Incubator</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>District</Label><Select value={form.district} onValueChange={v => setForm({...form, district: v})}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Organization</Label><Input value={form.organization} onChange={e => setForm({...form, organization: e.target.value})} placeholder="University / Company" /></div>
            {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">Already have an account? <Link href="/" className="text-gujarat-600 hover:underline font-medium">Sign in</Link></p>
        </CardContent>
      </Card>
    </div>
  );
}