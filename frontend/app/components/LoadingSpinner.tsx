'use client';

import React from 'react';

export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
      <div style={{
        width: 32, height: 32, border: '3px solid #e5e7eb',
        borderTopColor: '#16a34a', borderRadius: '50%',
        animation: 'spin .6s linear infinite',
        margin: '0 auto 12px',
      }} />
      <p style={{ fontSize: 14 }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function SkeletonCards({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ opacity: 0.6 }}>
          <div style={{ height: 16, background: '#e5e7eb', borderRadius: 4, marginBottom: 8, width: '60%' }} />
          <div style={{ height: 12, background: '#e5e7eb', borderRadius: 4, marginBottom: 6, width: '90%' }} />
          <div style={{ height: 12, background: '#e5e7eb', borderRadius: 4, width: '75%' }} />
        </div>
      ))}
    </div>
  );
}
