'use client';

import Link from 'next/link';
import { useAuth } from '../lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Icon } from '../components/ui/Icon';
import { TopNav } from '../components/ui/TopNav';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  roles: string[];
  badge?: string;
  isNew?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE PLATFORM',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator', 'govt_officer', 'procurement_officer', 'evaluator', 'validator', 'startup', 'auditor'] },
      { href: '/journey', label: 'Innovation Journey', icon: 'journey', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator', 'govt_officer', 'procurement_officer', 'evaluator', 'validator', 'startup', 'auditor'], badge: '11 Stages', isNew: true },
      { href: '/ai-command', label: 'AI Command Center', icon: 'command', roles: ['admin', 'govt_officer', 'procurement_officer', 'evaluator', 'validator', 'researcher', 'startup', 'auditor'], badge: 'AI/ML', isNew: true },
    ],
  },
  {
    title: 'DISCOVERY & CHALLENGES',
    items: [
      { href: '/challenges', label: 'Govt Challenges', icon: 'research', roles: ['admin', 'govt_officer', 'researcher', 'startup', 'evaluator', 'procurement_officer'] },
      { href: '/applications', label: 'Applications', icon: 'startup', roles: ['admin', 'govt_officer', 'startup', 'evaluator'] },
      { href: '/research', label: 'Research Projects', icon: 'research', roles: ['admin', 'researcher', 'mentor'] },
      { href: '/innovations', label: 'Innovations', icon: 'innovation', roles: ['admin', 'researcher', 'mentor'] },
      { href: '/ipr', label: 'IPR / Patents', icon: 'ipr', roles: ['admin', 'researcher'] },
      { href: '/startups', label: 'Startups & DPIIT', icon: 'startup', roles: ['admin', 'researcher', 'investor', 'govt_officer', 'startup'] },
      { href: '/ecosystem', label: 'Ecosystem & Mentors', icon: 'ecosystem', roles: ['admin', 'mentor', 'investor', 'incubator', 'researcher'] },
    ],
  },
  {
    title: 'PILOT & PERFORMANCE',
    items: [
      { href: '/evaluations', label: 'Evaluations', icon: 'audit', roles: ['admin', 'evaluator', 'govt_officer'] },
      { href: '/pilots', label: 'Pilots & Milestones', icon: 'startup', roles: ['admin', 'govt_officer', 'investor', 'startup', 'validator', 'procurement_officer'] },
      { href: '/validation', label: 'Performance Validation', icon: 'shield', roles: ['admin', 'validator', 'govt_officer', 'procurement_officer'] },
    ],
  },
  {
    title: 'PROCUREMENT & SCALE',
    items: [
      { href: '/procurement', label: 'Procurement Pipeline', icon: 'government', roles: ['admin', 'procurement_officer', 'govt_officer'] },
      { href: '/contracts', label: 'Contracts & POs', icon: 'government', roles: ['admin', 'procurement_officer', 'govt_officer'] },
      { href: '/impact', label: 'Citizen Impact', icon: 'impact', roles: ['admin', 'researcher', 'investor', 'govt_officer'] },
      { href: '/analytics', label: 'Analytics & TAT', icon: 'analytics', roles: ['admin', 'researcher', 'govt_officer', 'procurement_officer', 'auditor'] },
    ],
  },
  {
    title: 'GOVERNANCE & REDRESSAL',
    items: [
      { href: '/departments', label: 'Departments', icon: 'government', roles: ['admin', 'govt_officer'] },
      { href: '/grievances', label: 'Grievances & SLA', icon: 'notifications', roles: ['admin', 'govt_officer', 'startup'] },
      { href: '/templates', label: 'Templates & Clauses', icon: 'audit', roles: ['admin', 'govt_officer', 'procurement_officer'] },
      { href: '/government', label: 'Govt API Integrations', icon: 'government', roles: ['admin', 'researcher', 'govt_officer'] },
      { href: '/notifications', label: 'Notifications', icon: 'notifications', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator', 'govt_officer', 'procurement_officer', 'evaluator', 'validator', 'startup', 'auditor'] },
      { href: '/audit', label: 'Audit Log', icon: 'audit', roles: ['admin', 'auditor'] },
      { href: '/profile', label: 'Profile', icon: 'profile', roles: ['admin', 'researcher', 'mentor', 'investor', 'incubator', 'govt_officer', 'procurement_officer', 'evaluator', 'validator', 'startup', 'auditor'] },
      { href: '/settings', label: 'Settings', icon: 'settings', roles: ['admin'] },
    ],
  },
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
          padding: '16px 10px',
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
        <div style={{ padding: '0 10px 16px' }}>
          <Link href="/dashboard" style={{ fontWeight: 800, fontSize: 19, color: 'white', textDecoration: 'none', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--green-400, #f3ae39)' }}>↗</span> UdaanSetu
          </Link>
          <div style={{ fontSize: 11, color: '#92eaFF', marginTop: 2, fontWeight: 500, letterSpacing: '.02em' }}>From Research to Impact</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto', paddingRight: 2 }} aria-label="Primary">
          {NAV_SECTIONS.map(section => {
            const visibleItems = section.items.filter(item => item.roles.includes(user.role));
            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', color: '#6fb2d2', padding: '0 10px 4px', textTransform: 'uppercase' }}>
                  {section.title}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {visibleItems.map(item => {
                    const active = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href + '/'));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          padding: '8px 10px',
                          borderRadius: 8,
                          fontSize: 13,
                          fontWeight: active ? 600 : 400,
                          background: active ? 'rgba(255,255,255,.14)' : 'transparent',
                          color: active ? '#ffffff' : '#c8f3ff',
                          transition: 'background .15s, color .15s',
                          textDecoration: 'none',
                          border: active ? '1px solid rgba(255,255,255,.12)' : '1px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <Icon name={item.icon} size={16} strokeWidth={active ? 2.2 : 1.8} />
                          <span style={{ lineHeight: 1.25 }}>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 10,
                            background: item.isNew ? 'linear-gradient(135deg, #f3ae39, #d4880f)' : 'rgba(255,255,255,.15)',
                            color: item.isNew ? '#012348' : '#e0f7ff',
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
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
      <main id="main-content" style={{ flex: 1, marginLeft: 'var(--sidebar-width)', padding: '24px 32px', maxWidth: '100%', minHeight: '100vh' }} className="main-content">
        <TopNav onOpenMobile={() => setMobileOpen(true)} />
        {children}
      </main>
    </div>
  );
}