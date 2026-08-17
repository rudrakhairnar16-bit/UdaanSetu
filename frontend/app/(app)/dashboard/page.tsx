'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Dashboard } from '../../lib/types';

function RiskBadge({ level }: { level: string }) {
  const cls = level === 'High' ? 'badge-red' : level === 'Medium' ? 'badge-yellow' : 'badge-green';
  return <span className={`badge ${cls}`}>{level}</span>;
}

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    'draft': 'badge-gray', 'idea': 'badge-gray',
    'prototype': 'badge-blue', 'lab testing': 'badge-blue', 'field trial': 'badge-blue', 'validation': 'badge-blue',
    'ipr screening': 'badge-orange', 'screening': 'badge-orange',
    'filed': 'badge-yellow', 'examination': 'badge-yellow',
    'granted': 'badge-green', 'ready for market': 'badge-green', 'done': 'badge-green', 'completed': 'badge-green',
    'in progress': 'badge-blue', 'pending': 'badge-yellow',
    'pre-seed': 'badge-purple', 'seed': 'badge-green',
  };
  const cls = map[stage.toLowerCase()] || 'badge-gray';
  return <span className={`badge ${cls}`}>{stage}</span>;
}

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.12em', color: '#16a34a', fontWeight: 700, marginBottom: 4 }}>
            INNOVATION LIFECYCLE
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#14532d' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}.
          </h1>
        </div>
      </div>

      {/* DEMO banner */}
      <div style={{
        background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10,
        padding: '10px 14px', fontSize: 13, color: '#854d0e', marginBottom: 20,
      }}>
        {dash.banner}
      </div>

      {/* Pipeline flow */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, overflowX: 'auto' }}>
        {pipelineSteps.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13,
              background: ['#eff6ff', '#f0fdf4', '#fff7ed', '#fdf4ff'][i],
              color: ['#1e40af', '#166534', '#9a3412', '#86198f'][i],
              whiteSpace: 'nowrap',
            }}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
              <span style={{ marginLeft: 8, fontWeight: 400, opacity: .7 }}>
                {dash.pipeline?.[step]?.total || 0}
              </span>
            </div>
            {i < pipelineSteps.length - 1 && (
              <div style={{ fontSize: 18, color: '#d1d5db', padding: '0 8px' }}>→</div>
            )}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: '#d1d5db', padding: '0 8px' }}>→</div>
          <div style={{
            padding: '12px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13,
            background: '#fef2f2', color: '#991b1b', whiteSpace: 'nowrap',
          }}>
            Impact
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {Object.entries(dash.counts).map(([k, v]) => (
          <div className="stat-card" key={k}>
            <span className="label">{k.replace('_', ' ')}</span>
            <span className="value">{String(v)}</span>
          </div>
        ))}
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* At risk */}
        <div className="card">
          <div className="card-header">
            <h3>⚠️ At Risk</h3>
          </div>
          {dash.at_risk.length === 0 ? (
            <p className="empty" style={{ padding: 16 }}>No projects at risk</p>
          ) : (
            dash.at_risk.map(r => (
              <div key={r.id} style={{
                padding: '10px 0', borderBottom: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {r.reasons.join(' · ')}
                  </div>
                  {r.confidence !== undefined && (
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                      Confidence: {r.confidence}% · {r.method || 'ML model'}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.score}/100</span>
                  <RiskBadge level={r.level} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent records */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          {dash.recent.length === 0 ? (
            <p className="empty" style={{ padding: 16 }}>No records yet</p>
          ) : (
            dash.recent.map(r => (
              <div key={r.id} style={{
                padding: '10px 0', borderBottom: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                    {r.kind} · {r.district || 'No district'}
                  </div>
                </div>
                <StageBadge stage={r.stage} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
