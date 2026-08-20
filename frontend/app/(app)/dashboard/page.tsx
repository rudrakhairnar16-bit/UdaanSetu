'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Dashboard } from '../../lib/types';
import { StageBadge } from '../../components/StageBadge';
import { PageHeader, Icon } from '../../components/ui';

function RiskBadge({ level }: { level: string }) {
  const cls = level === 'High' ? 'badge-red' : level === 'Medium' ? 'badge-yellow' : 'badge-green';
  return <span className={`badge ${cls}`}>{level}</span>;
}

const STAT_META: Record<string, { icon: string; color: string }> = {
  research: { icon: 'research', color: '#2563eb' },
  innovation: { icon: 'innovation', color: '#16a34a' },
  ipr: { icon: 'ipr', color: '#f97316' },
  startup: { icon: 'startup', color: '#7c3aed' },
  mentor: { icon: 'profile', color: '#0891b2' },
  scheme: { icon: 'government', color: '#059669' },
  incubator: { icon: 'ecosystem', color: '#db2777' },
  funding_request: { icon: 'rocket', color: '#ea580c' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Dashboard>('/dashboard')
      .then(d => { setDash(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 40, color: '#ef4444' }}>Error: {error}</div>;
  if (!dash) return null;

  const pipelineSteps = ['research', 'innovation', 'ipr', 'startup'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#16a34a', fontWeight: 700, marginBottom: 4 }}>INNOVATION LIFECYCLE</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#14532d', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}.
          </h1>
        </div>
      </div>

      <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#854d0e', marginBottom: 20 }}>
        {dash.banner}
      </div>

      {/* Pipeline flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {pipelineSteps.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: ['#eff6ff', '#f0fdf4', '#fff7ed', '#faf5ff'][i], color: ['#1e40af', '#166534', '#9a3412', '#6b21a8'][i], whiteSpace: 'nowrap', boxShadow: 'var(--shadow-xs)' }}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
              <span style={{ marginLeft: 8, fontWeight: 800, opacity: .8, fontSize: 15 }}>{dash.pipeline?.[step]?.total || 0}</span>
            </div>
            {i < pipelineSteps.length - 1 && <div style={{ fontSize: 18, color: '#d1d5db', padding: '0 8px' }}>→</div>}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: '#d1d5db', padding: '0 8px' }}>→</div>
          <div style={{ padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: '#fef2f2', color: '#991b1b', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-xs)' }}>Impact</div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        {Object.entries(dash.counts).map(([k, v]) => {
          const meta = STAT_META[k] || { icon: 'dashboard', color: '#64748b' };
          return (
            <div className="stat-card" key={k}>
              <span className="label">{k.replace('_', ' ')}</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="value">{String(v)}</span>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}14`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={meta.icon} size={18} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>At Risk</h3>
            <RiskBadge level={dash.at_risk.length > 0 ? 'High' : 'Low'} />
          </div>
          {dash.at_risk.length === 0 ? (
            <p className="empty" style={{ padding: 16 }}>No projects at risk</p>
          ) : dash.at_risk.map(r => (
            <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{r.reasons.join(' · ')}</div>
                {r.confidence !== undefined && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Confidence: {r.confidence}% · {r.method || 'ML model'}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.score > 70 ? '#dc2626' : '#d97706' }}>{r.score}/100</span>
                <RiskBadge level={r.level} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header"><h3>Recent Activity</h3></div>
          {dash.recent.length === 0 ? (
            <p className="empty" style={{ padding: 16 }}>No records yet</p>
          ) : dash.recent.map(r => (
            <div key={r.id} style={{ padding: '10px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{r.kind} · {r.district || 'No district'}</div>
              </div>
              <StageBadge stage={r.stage} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}