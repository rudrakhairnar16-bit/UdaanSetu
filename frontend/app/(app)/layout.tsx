'use client';

import { useAuth } from '../lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator'] },
  { href: '/research', label: 'Research Projects', icon: '🔬', roles: ['admin', 'researcher'] },
  { href: '/innovations', label: 'Innovations', icon: '💡', roles: ['admin', 'researcher', 'mentor'] },
  { href: '/ipr', label: 'IPR / Patents', icon: '📜', roles: ['admin', 'researcher'] },
  { href: '/startups', label: 'Startups', icon: '🚀', roles: ['admin', 'researcher', 'investor'] },
  { href: '/ecosystem', label: 'Ecosystem', icon: '🤝', roles: ['admin', 'mentor', 'investor', 'incubator', 'researcher'] },
  { href: '/analytics', label: 'Analytics', icon: '📈', roles: ['admin', 'researcher'] },
  { href: '/impact', label: 'Impact', icon: '🌍', roles: ['admin', 'researcher', 'investor'] },
  { href: '/notifications', label: 'Notifications', icon: '🔔', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator'] },
  { href: '/profile', label: 'Profile', icon: '👤', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator'] },
  { href: '/audit', label: 'Audit Log', icon: '📋', roles: ['admin'] },
  { href: '/settings', label: 'Settings', icon: '⚙️', roles: ['admin'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Loading UdaanSetu...</div>
      </div>
    );
  }

  if (!user) return null;

  const filtered = NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: '#0c3b26',
        color: '#d1fae5',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        transition: 'transform .2s',
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}
        className="sidebar"
      >
        <div style={{ padding: '0 12px 24px' }}>
          <div style={{ fontWeight: 800, fontSize: 20, color: 'white' }}>↗ UdaanSetu</div>
          <div style={{ fontSize: 11, color: '#86efac', marginTop: 2 }}>Research to impact</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {filtered.map(item => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  background: active ? '#166534' : 'transparent',
                  color: active ? 'white' : '#bbf7d0',
                  transition: 'background .15s',
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div style={{
          padding: 12,
          fontSize: 11,
          color: '#86efac',
          lineHeight: 1.6,
          borderTop: '1px solid #166534',
          marginTop: 12,
        }}>
          <div style={{ fontWeight: 600, color: '#bbf7d0' }}>{user.name}</div>
          <div style={{ textTransform: 'capitalize' }}>{user.role}</div>
          <div>{user.district || 'No district'}</div>
        </div>

        <button
          onClick={async () => { await logout(); router.push('/'); }}
          style={{
            marginTop: 8,
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: 14,
            color: '#fca5a5',
            textAlign: 'left',
            width: '100%',
          }}
        >
          Sign out
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 240, padding: '24px 32px', maxWidth: '100%' }} className="main-content">
        {/* Mobile header */}
        <div style={{
          display: 'none',
          marginBottom: 16,
          alignItems: 'center',
          justifyContent: 'space-between',
        }} className="mobile-header">
          <button
            onClick={() => setMobileOpen(true)}
            style={{ fontSize: 20, padding: 8 }}
          >
            ☰
          </button>
          <span style={{ fontWeight: 700 }}>↗ UdaanSetu</span>
        </div>

        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: ${mobileOpen ? 'translateX(0)' : 'translateX(-100%)'} !important; }
          .main-content { margin-left: 0 !important; padding: 16px !important; }
          .mobile-header { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
