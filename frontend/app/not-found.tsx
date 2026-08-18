import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: 'var(--gray-300)' }}>404</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Page not found</h2>
        <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 20 }}>The page you are looking for does not exist.</p>
        <Link href="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  );
}
