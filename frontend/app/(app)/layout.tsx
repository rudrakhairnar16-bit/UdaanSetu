'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Icon } from '../components/ui/Icon';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator', 'govt_officer'] },
  { href: '/research', label: 'Research Projects', icon: 'research', roles: ['admin', 'researcher'] },
  { href: '/innovations', label: 'Innovations', icon: 'innovation', roles: ['admin', 'researcher', 'mentor'] },
  { href: '/ipr', label: 'IPR / Patents', icon: 'ipr', roles: ['admin', 'researcher'] },
  { href: '/startups', label: 'Startups', icon: 'startup', roles: ['admin', 'researcher', 'investor', 'govt_officer'] },
  { href: '/ecosystem', label: 'Ecosystem', icon: 'ecosystem', roles: ['admin', 'mentor', 'investor', 'incubator', 'researcher'] },
  { href: '/government', label: 'Govt APIs', icon: 'government', roles: ['admin', 'researcher'] },
  { href: '/analytics', label: 'Analytics', icon: 'analytics', roles: ['admin', 'researcher', 'govt_officer'] },
  { href: '/impact', label: 'Impact', icon: 'impact', roles: ['admin', 'researcher', 'investor'] },
  { href: '/challenges', label: 'Challenges', icon: 'research', roles: ['admin', 'govt_officer', 'researcher'] },
  { href: '/applications', label: 'Applications', icon: 'startup', roles: ['admin', 'govt_officer', 'startup'] },
  { href: '/evaluations', label: 'Evaluations', icon: 'audit', roles: ['admin', 'evaluator', 'govt_officer'] },
  { href: '/pilots', label: 'Pilots', icon: 'startup', roles: ['admin', 'govt_officer', 'investor'] },
  { href: '/validation', label: 'Validation', icon: 'audit', roles: ['admin', 'validator', 'govt_officer'] },
  { href: '/procurement', label: 'Procurement', icon: 'government', roles: ['admin', 'procurement_officer', 'govt_officer'] },
  { href: '/contracts', label: 'Contracts & POs', icon: 'government', roles: ['admin', 'procurement_officer', 'govt_officer'] },
  { href: '/departments', label: 'Departments', icon: 'government', roles: ['admin', 'govt_officer'] },
  { href: '/grievances', label: 'Grievances', icon: 'notifications', roles: ['admin', 'govt_officer', 'startup'] },
  { href: '/templates', label: 'Templates', icon: 'audit', roles: ['admin', 'govt_officer'] },
  { href: '/notifications', label: 'Notifications', icon: 'notifications', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator', 'govt_officer'] },
  { href: '/profile', label: 'Profile', icon: 'profile', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator', 'govt_officer'] },
  { href: '/audit', label: 'Audit Log', icon: 'audit', roles: ['admin'] },
  { href: '/settings', label: 'Settings', icon: 'settings', roles: ['admin'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (!mobileOpen || !sidebarRef.current) return;
    if (e.key === 'Escape') {
      setMobileOpen(false);
      return;
    }
    if (e.key === 'Tab') {
      const focusable = sidebarRef.current.querySelectorAll<HTMLElement>('a, button');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, [mobileOpen]);

  useEffect(() => {
    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [trapFocus]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--gray-500)' }}>Loading UdaanSetu...</div>
      </div>
    );
  }

  if (!user) return null;

  const filtered = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <a href="#main-content" className="skip-link">Skip to content</a>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'transparent', zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}
        style={{
          width: 'var(--sidebar-width)',
          background: 'linear-gradient(180deg, #012348 0%, #011a38 100%)',
          color: '#e0f7ff',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 12px',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transition: 'transform .2s',
          boxShadow: '4px 0 24px rgba(1,35,72,.12)',
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div style={{ padding: '0 12px 22px' }}>
          <Link href="/dashboard" style={{ fontWeight: 800, fontSize: 20, color: 'white', textDecoration: 'none', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>↗ UdaanSetu</Link>
          <div style={{ fontSize: 11, color: '#92eaFF', marginTop: 3, fontWeight: 500 }}>Research to impact</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, overflowY: 'auto' }} aria-label="Primary">
          {filtered.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 12px',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  background: active ? 'rgba(255,255,255,.1)' : 'transparent',
                  color: active ? 'white' : '#b0f0ff',
                  transition: 'background .15s, color .15s',
                  textDecoration: 'none',
                  border: active ? '1px solid rgba(255,255,255,.08)' : '1px solid transparent',
                }}
              >
                <Icon name={item.icon} size={18} strokeWidth={1.8} />
                <span style={{ lineHeight: 1.3 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div style={{
          padding: 14,
          background: 'rgba(255,255,255,.06)',
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,.08)',
          marginTop: 12,
        }}>
          <div style={{ fontWeight: 600, color: '#e0f7ff', fontSize: 13 }}>{user.name}</div>
          <div style={{ textTransform: 'capitalize', fontSize: 12, color: '#92eaFF', marginTop: 2 }}>{user.role}</div>
          {user.district && <div style={{ fontSize: 11, color: '#b0f0ff', marginTop: 2 }}>{user.district}</div>}
        </div>

        <button
          onClick={async () => { await logout(); router.push('/'); }}
          style={{
            marginTop: 8,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 14,
            color: '#fca5a5',
            textAlign: 'left',
            width: '100%',
            minHeight: 44,
            display: 'flex',
            alignItems: 'center',
            gap: 11,
            transition: 'background .15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Icon name="logout" size={18} strokeWidth={1.8} />
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main id="main-content" style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '28px 36px', maxWidth: '100%' }} className="main-content">
        {/* Mobile header */}
        <div className="mobile-header" style={{ marginBottom: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            style={{ fontSize: 20, padding: 8, minHeight: 44, minWidth: 44 }}
          >
            <Icon name="menu" size={22} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 18 }}>↗ UdaanSetu</span>
        </div>

        {children}
      </main>
    </div>
  );
}