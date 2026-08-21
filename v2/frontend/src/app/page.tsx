'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@udaansetu.demo');
  const [password, setPassword] = useState('Demo@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // TODO: Call trpc auth.login
      await new Promise(r => setTimeout(r, 1000));
      localStorage.setItem('auth_token', 'demo-token');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gujarat-50 via-white to-gujarat-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gujarat-600">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">UdaanSetu</CardTitle>
          <CardDescription>
            Gujarat Innovation Ecosystem Platform
          </CardDescription>
          <p className="text-xs text-gujarat-600 font-medium mt-2">SIH1608 Prototype</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@udaansetu.demo"
                required
                autoComplete="username"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Demo@123"
                required
                autoComplete="current-password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className={cn('p-3 text-sm text-destructive bg-destructive/10 rounded-md')}>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Enter Gujarat Ecosystem'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gujarat-50 rounded-lg border border-gujarat-100">
            <p className="text-xs font-medium text-gujarat-800 mb-2">Demo Credentials</p>
            <div className="text-xs text-gujarat-700 space-y-1 font-mono">
              <div>Admin: admin@udaansetu.demo / Demo@123</div>
              <div>Researcher: researcher@udaansetu.demo / Demo@123</div>
              <div>Mentor: mentor@udaansetu.demo / Demo@123</div>
              <div>Investor: investor@udaansetu.demo / Demo@123</div>
              <div>Incubator: incubator@udaansetu.demo / Demo@123</div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            All data is <strong>DEMO DATA</strong>. Not government data.
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="text-gujarat-600 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}