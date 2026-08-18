'use client';

import React from 'react';

export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
      <div style={{
        width: 32, height: 32, border: '3px solid var(--gray-200)',
        borderTopColor: 'var(--green-600)', borderRadius: '50%',
        animation: 'spin .6s linear infinite',
        margin: '0 auto 12px',
      }} />
      <p style={{ fontSize: 14 }}>{text}</p>
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ opacity: 0.6, pointerEvents: 'none' }}>
          <div style={{ height: 16, background: 'var(--gray-200)', borderRadius: 4, marginBottom: 8, width: '60%' }} />
          <div style={{ height: 12, background: 'var(--gray-200)', borderRadius: 4, marginBottom: 6, width: '90%' }} />
          <div style={{ height: 12, background: 'var(--gray-200)', borderRadius: 4, width: '75%' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="card">
      <div style={{ display: 'grid', gap: 12 }}>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', opacity: 0.5 }}>
            <div style={{ height: 14, background: 'var(--gray-200)', borderRadius: 4, flex: 2 }} />
            <div style={{ height: 14, background: 'var(--gray-200)', borderRadius: 4, flex: 1 }} />
            <div style={{ height: 14, background: 'var(--gray-200)', borderRadius: 4, flex: 1 }} />
            <div style={{ height: 14, background: 'var(--gray-200)', borderRadius: 4, flex: 1 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
