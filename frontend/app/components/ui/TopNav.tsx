'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Icon } from './Icon';

export interface TopNavProps {
  onOpenMobile?: () => void;
}

export function TopNav({ onOpenMobile }: TopNavProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Generate breadcrumb titles
  const getBreadcrumb = () => {
    if (!pathname || pathname === '/dashboard') return 'Innovation Dashboard';
    if (pathname === '/journey') return 'Innovation Journey (11 Stages)';
    if (pathname === '/ai-command') return 'AI Innovation Command Center';
    if (pathname.startsWith('/challenges')) return 'Government Challenges';
    if (pathname.startsWith('/applications')) return 'Startup Applications';
    if (pathname.startsWith('/pilots')) return 'Pilot Projects & Milestones';
    if (pathname.startsWith('/validation')) return 'Independent Performance Validation';
    if (pathname.startsWith('/procurement')) return 'Public Procurement Pipeline';
    if (pathname.startsWith('/contracts')) return 'Contracts & Purchase Orders';
    if (pathname.startsWith('/evaluations')) return 'Expert Committee Evaluations';
    if (pathname.startsWith('/impact')) return 'Citizen & Economic Impact';
    if (pathname.startsWith('/analytics')) return 'Analytics & TAT Metrics';
    if (pathname.startsWith('/research')) return 'Research Projects';
    if (pathname.startsWith('/innovations')) return 'Innovations Portfolio';
    if (pathname.startsWith('/ipr')) return 'IPR & Patents';
    if (pathname.startsWith('/startups')) return 'Startups & DPIIT Registry';
    if (pathname.startsWith('/ecosystem')) return 'Ecosystem & Mentors';
    if (pathname.startsWith('/departments')) return 'Government Departments';
    if (pathname.startsWith('/grievances')) return 'Grievance Redressal (SLA)';
    if (pathname.startsWith('/templates')) return 'Procurement Templates';
    if (pathname.startsWith('/audit')) return 'Immutable Audit Trail';
    if (pathname.startsWith('/notifications')) return 'System Notifications';
    if (pathname.startsWith('/settings')) return 'Platform Settings';
    if (pathname.startsWith('/profile')) return 'User Profile';
    return 'UdaanSetu Platform';
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border-soft)',
      borderRadius: '12px',
      marginBottom: '24px',
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Left breadcrumb area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>
          UdaanSetu
        </span>
        <span style={{ color: 'var(--gray-300)', fontSize: 12 }}>/</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {getBreadcrumb()}
        </span>
      </div>

      {/* Right control pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>


        {/* State / Environment Indicator */}
        <div className="hide-on-mobile" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: 'rgba(2,132,199,.08)',
          border: '1px solid rgba(2,132,199,.2)',
          borderRadius: 20,
          fontSize: 11,
          fontWeight: 700,
          color: '#0284c7',
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#0284c7',
            display: 'inline-block',
          }} />
          Maharashtra &middot; State Node
        </div>

        {/* Quick link to AI Command Center */}
        <Link
          href="/ai-command"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '5px 12px',
            borderRadius: 8,
            background: 'var(--surface-soft)',
            border: '1px solid var(--border-soft)',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-primary)',
            textDecoration: 'none',
          }}
        >
          <Icon name="sparkles" size={14} style={{ color: 'var(--green-600, #d4880f)' }} />
          <span>AI Radar</span>
        </Link>

        {/* Notifications Icon with live counter badge */}
        <Link
          href="/notifications"
          style={{
            position: 'relative',
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'var(--surface-soft)',
            border: '1px solid var(--border-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            textDecoration: 'none',
          }}
          aria-label="Notifications"
        >
          <Icon name="notifications" size={16} />
          <span style={{
            position: 'absolute',
            top: -2,
            right: -2,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#ef4444',
            border: '2px solid var(--surface)',
          }} />
        </Link>

        {/* User Pill */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 10px 4px 6px',
            background: 'var(--surface-soft)',
            border: '1px solid var(--border-soft)',
            borderRadius: 20,
          }}>
            <div style={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #012348, #0a7fb8)',
              color: '#ffffff',
              fontSize: 11,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
              {user.name?.split(' ')[0]}
            </div>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: 10,
              background: 'var(--green-100, #fdecc8)',
              color: 'var(--green-800, #7a4d06)',
              textTransform: 'uppercase',
            }}>
              {user.role}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
