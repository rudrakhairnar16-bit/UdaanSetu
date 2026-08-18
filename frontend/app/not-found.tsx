import React from 'react';

export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, fontWeight: 800, color: '#d1d5db' }}>404</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Page not found</h2>
        <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 20 }}>The page you are looking for does not exist.</p>
        <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
      </div>
    </div>
  );
}
