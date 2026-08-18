'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function ImpactPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview').then(d => { setAnalytics(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading impact data..." />;
  if (!analytics) return <div className="empty"><p>Failed to load analytics</p></div>;

  const sectors = Object.entries(analytics.by_sector || {}).sort((a: any, b: any) => b[1] - a[1]);
  const districts = Object.entries(analytics.by_district || {}).sort((a: any, b: any) => b[1] - a[1]);
  const maxSector = Math.max(...sectors.map((s: any) => s[1]), 1);
  const maxDistrict = Math.max(...districts.map((d: any) => d[1]), 1);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Impact Dashboard</h1>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>{analytics.label}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: analytics.total_records },
          { label: 'Jobs Created', value: analytics.total_jobs_created },
          { label: 'Users/Farmers Reached', value: analytics.total_farmers_reached.toLocaleString() },
          { label: 'Total Revenue', value: `₹${(analytics.total_startup_revenue / 1e5).toFixed(1)}L` },
          { label: 'Avg Research Progress', value: `${analytics.avg_research_progress}%` },
          { label: 'Funding Required', value: `₹${(analytics.total_funding_required / 1e5).toFixed(1)}L` },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <span className="label">{s.label}</span>
            <span className="value">{s.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Records by Sector</h3>
          {sectors.length === 0 && <div className="empty"><p>No sector data</p></div>}
          {sectors.map(([sector, count]: any) => (
            <div key={sector} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
                <span style={{ fontWeight: 600 }}>{sector || 'General'}</span>
                <span style={{ color: '#6b7280' }}>{count}</span>
              </div>
              <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(count / maxSector) * 100}%`, background: '#16a34a', borderRadius: 4, transition: 'width .3s' }} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Records by District</h3>
          {districts.length === 0 && <div className="empty"><p>No district data</p></div>}
          {districts.map(([district, count]: any) => (
            <div key={district} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 2 }}>
                <span style={{ fontWeight: 600 }}>{district}</span>
                <span style={{ color: '#6b7280' }}>{count}</span>
              </div>
              <div style={{ height: 8, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(count / maxDistrict) * 100}%`, background: '#3b82f6', borderRadius: 4, transition: 'width .3s' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
