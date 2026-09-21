'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, analytics } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Dashboard } from '../../lib/types';
import { StageBadge } from '../../components/StageBadge';
import { Icon } from '../../components/ui';

interface EcosystemAnalytics {
  total_startups?: number;
  districts_count?: number;
  sectors_count?: number;
  by_district?: Record<string, number>;
  by_sector?: Record<string, number>;
  by_stage?: Record<string, number>;
  total_records?: number;
}

function RiskBadge({ level }: { level: string }) {
  const cls = level === 'High' ? 'badge-red' : level === 'Medium' ? 'badge-yellow' : 'badge-green';
  return <span className={`badge ${cls}`}>{level}</span>;
}

const STAT_META: Record<string, { icon: string; color: string }> = {
  research: { icon: 'research', color: '#012348' },
  innovation: { icon: 'innovation', color: 'var(--green-600)' },
  ipr: { icon: 'ipr', color: '#f97316' },
  startup: { icon: 'startup', color: '#7c3aed' },
  mentor: { icon: 'profile', color: '#2ebdff' },
  scheme: { icon: 'government', color: '#b37209' },
  incubator: { icon: 'ecosystem', color: '#db2777' },
  funding_request: { icon: 'rocket', color: '#ea580c' },
};

const STAGE_COLORS: Record<string, string> = {
  Active: 'var(--green-600)',
  Scaling: 'var(--blue-600)',
  'Early Traction': 'var(--orange-500)',
  Prototype: 'var(--violet-800)',
  Validation: 'var(--yellow-500)',
};

const JOURNEY_STEPS_OVERVIEW = [
  { step: 1, name: 'Research', color: '#0284c7' },
  { step: 2, name: 'Govt Challenge', color: '#d97706' },
  { step: 3, name: 'Discovery', color: '#7c3aed' },
  { step: 4, name: 'AI Validation', color: '#2563eb' },
  { step: 5, name: 'Evaluation', color: '#9333ea' },
  { step: 6, name: 'Pilot', color: '#ea580c' },
  { step: 7, name: 'Validation', color: '#059669' },
  { step: 8, name: 'Payment', color: '#16a34a' },
  { step: 9, name: 'Procurement', color: '#0891b2' },
  { step: 10, name: 'Scale', color: '#4f46e5' },
  { step: 11, name: 'Impact', color: '#dc2626' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [eco, setEco] = useState<EcosystemAnalytics | null>(null);
  const [funnel, setFunnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Dashboard>('/dashboard'),
      analytics.maharashtra().catch(() => analytics.overview()),
      analytics.pipelineFunnel().catch(() => ({ funnel: [] })),
    ])
      .then(([d, g, fnl]) => {
        setDash(d);
        setEco(g);
        setFunnel(fnl?.funnel || []);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading UdaanSetu Command Center...</div>;
  if (error) return <div style={{ padding: 40, color: 'var(--red-500)' }}>Error: {error}</div>;
  if (!dash) return null;

  const topDistricts = eco?.by_district
    ? Object.entries(eco.by_district)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
    : [];
  const districtMax = topDistricts.length > 0 ? topDistricts[0][1] : 1;

  const topSectors = eco?.by_sector
    ? Object.entries(eco.by_sector)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
    : [];
  const sectorMax = topSectors.length > 0 ? topSectors[0][1] : 1;

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.12em', color: 'var(--green-600)', fontWeight: 700, marginBottom: 4 }}>
            FROM RESEARCH TO IMPACT &middot; COMMAND CENTER
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-900)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', margin: 0 }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}.
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link
            href="/journey"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #012348 0%, #013158 100%)',
              color: '#ffffff',
              padding: '9px 16px',
              borderRadius: 8,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(1,35,72,.2)',
            }}
          >
            <Icon name="journey" size={15} />
            11-Stage Journey Tracker →
          </Link>

          <Link
            href="/ai-command"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'linear-gradient(135deg, #f3ae39 0%, #d4880f 100%)',
              color: '#012348',
              padding: '9px 16px',
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 13,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(212,136,15,.3)',
            }}
          >
            <Icon name="command" size={15} />
            AI Command Center →
          </Link>
        </div>
      </div>

      {/* Primary 11-Stage Pipeline Ribbon */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        boxShadow: 'var(--shadow-xs)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
            Primary Innovation Pipeline (11 Stages)
          </div>
          <Link href="/journey" style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-700)', textDecoration: 'none' }}>
            Open Interactive Board &rarr;
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {JOURNEY_STEPS_OVERVIEW.map((s, idx) => (
            <div
              key={s.step}
              style={{
                flex: 1,
                minWidth: 90,
                background: 'var(--surface-soft)',
                borderRadius: 8,
                padding: '8px 10px',
                borderLeft: `3px solid ${s.color}`,
              }}
            >
              <div style={{ fontSize: 10, fontWeight: 700, color: s.color }}>STAGE {s.step}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {s.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ecosystem DPIIT Stats Banner */}
      {eco && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Registered Startups', value: (eco.total_startups || 452).toLocaleString(), color: '#7c3aed' },
            { label: 'Districts Covered', value: String(eco.districts_count || 36), color: '#0284c7' },
            { label: 'Active Sectors', value: String(eco.sectors_count || 28), color: '#b37209' },
            { label: 'Procurement Pipelines', value: String(funnel.length || 9), color: '#ea580c' },
          ].map(kpi => (
            <div key={kpi.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '16px 18px', boxShadow: 'var(--shadow-xs)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>{kpi.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, fontFamily: 'var(--font-display)' }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Counts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        {Object.entries(dash.counts).map(([k, v]) => {
          const meta = STAT_META[k] || { icon: 'dashboard', color: '#64748b' };
          const displayVal = k === 'startup' && eco?.total_startups ? eco.total_startups.toLocaleString() : String(v);
          return (
            <div className="stat-card" key={k}>
              <span className="label">{k.replace('_', ' ')}</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="value">{displayVal}</span>
                <span style={{ width: 36, height: 36, borderRadius: 10, background: `${meta.color}14`, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={meta.icon} size={18} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Section: Risk Engine & Recent Pipeline Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="two-col">
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>AI Risk Model Flags</h3>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Gradient-Boosted Failure Risk Scorer</div>
            </div>
            <Link href="/ai-command" style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-700)', textDecoration: 'none' }}>
              Full Model &rarr;
            </Link>
          </div>
          {dash.at_risk.length === 0 ? (
            <p className="empty" style={{ padding: 16 }}>No projects currently flagged at risk</p>
          ) : dash.at_risk.slice(0, 5).map((r, idx) => (
            <div key={r.id || idx} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{r.reasons.join(' · ')}</div>
                {r.confidence !== undefined && <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 2 }}>Confidence: {r.confidence}% · {r.method || 'ML model'}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: r.score > 70 ? 'var(--red-600)' : 'var(--amber-600)' }}>{r.score}/100</span>
                <RiskBadge level={r.level} />
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Recent Lifecycle Activity</h3>
              <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>Audit Trail & Progress Transitions</div>
            </div>
            <Link href="/audit" style={{ fontSize: 12, fontWeight: 600, color: 'var(--green-700)', textDecoration: 'none' }}>
              View Audit &rarr;
            </Link>
          </div>
          {dash.recent.length === 0 ? (
            <p className="empty" style={{ padding: 16 }}>No recent lifecycle updates</p>
          ) : dash.recent.slice(0, 5).map((r, idx) => (
            <div key={r.id || idx} style={{ padding: '12px 16px', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{r.kind} &middot; {r.district || 'Statewide'}</div>
              </div>
              <StageBadge stage={r.stage} />
            </div>
          ))}
        </div>
      </div>

      {/* District Distribution Card */}
      {eco && topDistricts.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Top Geographic Districts by Innovation Density</h3></div>
          <div style={{ padding: '14px 18px' }}>
            {topDistricts.map(([district, count]) => (
              <div key={district} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                <div style={{ width: 130, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', textAlign: 'right', flexShrink: 0 }}>{district}</div>
                <div style={{ flex: 1, height: 22, background: 'var(--gray-100)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / districtMax) * 100}%`,
                    background: 'linear-gradient(90deg, #0284c7, #012348)',
                    borderRadius: 6,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ width: 60, fontSize: 13, fontWeight: 700, color: '#012348', textAlign: 'right' }}>{count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
