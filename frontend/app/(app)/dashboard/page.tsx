'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Dashboard } from '../../lib/types';
import { StageBadge } from '../../components/StageBadge';
import { Icon } from '../../components/ui';

interface GujaratAnalytics {
  total_startups: number;
  districts_count: number;
  sectors_count: number;
  by_district: Record<string, number>;
  by_sector: Record<string, number>;
  by_stage: Record<string, number>;
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

export default function DashboardPage() {
  const { user } = useAuth();
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [gujarat, setGujarat] = useState<GujaratAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get<Dashboard>('/dashboard'),
      api.get<GujaratAnalytics>('/analytics/gujarat'),
    ])
      .then(([d, g]) => {
        setDash(d);
        setGujarat(g);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading dashboard...</div>;
  if (error) return <div style={{ padding: 40, color: 'var(--red-500)' }}>Error: {error}</div>;
  if (!dash) return null;

  const pipelineSteps = ['research', 'innovation', 'ipr', 'startup'];

  const topDistricts = gujarat
    ? Object.entries(gujarat.by_district)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    : [];
  const districtMax = topDistricts.length > 0 ? topDistricts[0][1] : 1;

  const topSectors = gujarat
    ? Object.entries(gujarat.by_sector)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
    : [];
  const sectorMax = topSectors.length > 0 ? topSectors[0][1] : 1;

  const stageEntries = gujarat
    ? Object.entries(gujarat.by_stage).sort((a, b) => b[1] - a[1])
    : [];
  const stageMax = stageEntries.length > 0 ? stageEntries[0][1] : 1;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.12em', color: 'var(--green-600)', fontWeight: 700, marginBottom: 4 }}>INNOVATION LIFECYCLE</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--green-900)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}.
          </h1>
        </div>
      </div>

      <div style={{ background: '#fef7e8', border: '1px solid #fdecc8', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#7a4d06', marginBottom: 20, fontWeight: 600 }}>
        REAL Gujarat DPIIT Data — {gujarat ? gujarat.total_startups.toLocaleString() : '—'} registered startups across {gujarat ? gujarat.districts_count : '—'} districts
      </div>

      {gujarat && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {(() => {
            const topEntry = Object.entries(gujarat.by_district).sort((a, b) => b[1] - a[1])[0];
            const topDistrict = topEntry ? topEntry[0] : '—';
            const topCount = topEntry ? topEntry[1] : 0;
            return [
              { label: 'Total Startups', value: gujarat.total_startups.toLocaleString(), color: '#7c3aed' },
              { label: 'Districts', value: String(gujarat.districts_count), color: '#2ebdff' },
              { label: 'Sectors', value: String(gujarat.sectors_count), color: '#b37209' },
              { label: 'Top District', value: `${topDistrict} (${topCount.toLocaleString()})`, color: '#ea580c' },
            ].map(kpi => (
              <div key={kpi.label} style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 12, padding: '16px 18px', boxShadow: 'var(--shadow-xs)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6 }}>{kpi.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, fontFamily: 'var(--font-display)' }}>{kpi.value}</div>
              </div>
            ));
          })()}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
        {pipelineSteps.map((step, i) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: ['var(--blue-50)', 'var(--green-50)', 'var(--orange-50)', 'var(--violet-50)'][i], color: ['var(--blue-700)', 'var(--green-800)', 'var(--orange-800)', 'var(--violet-700)'][i], whiteSpace: 'nowrap', boxShadow: 'var(--shadow-xs)' }}>
              {step.charAt(0).toUpperCase() + step.slice(1)}
              <span style={{ marginLeft: 8, fontWeight: 800, opacity: .8, fontSize: 15 }}>{dash.pipeline?.[step]?.total || 0}</span>
            </div>
            {i < pipelineSteps.length - 1 && <div style={{ fontSize: 18, color: 'var(--gray-300)', padding: '0 8px' }}>→</div>}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 18, color: 'var(--gray-300)', padding: '0 8px' }}>→</div>
          <div style={{ padding: '12px 20px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'var(--red-100)', color: 'var(--red-700)', whiteSpace: 'nowrap', boxShadow: 'var(--shadow-xs)' }}>Impact</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, marginBottom: 24 }}>
        {Object.entries(dash.counts).map(([k, v]) => {
          const meta = STAT_META[k] || { icon: 'dashboard', color: '#64748b' };
          const displayVal = k === 'startup' && gujarat ? gujarat.total_startups.toLocaleString() : String(v);
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

      {gujarat && topDistricts.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Top 10 Districts by Startup Count</h3></div>
          <div style={{ padding: '12px 16px' }}>
            {topDistricts.map(([district, count]) => (
              <div key={district} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                <div style={{ width: 120, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', textAlign: 'right', flexShrink: 0 }}>{district}</div>
                <div style={{ flex: 1, height: 24, background: 'var(--gray-100)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / districtMax) * 100}%`,
                    background: 'linear-gradient(90deg, var(--green-500), var(--green-600))',
                    borderRadius: 6,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ width: 60, fontSize: 13, fontWeight: 700, color: 'var(--green-700)', textAlign: 'right' }}>{count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gujarat && topSectors.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Top 10 Sectors</h3></div>
          <div style={{ padding: '12px 16px' }}>
            {topSectors.map(([sector, count]) => (
              <div key={sector} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                <div style={{ width: 140, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sector}</div>
                <div style={{ flex: 1, height: 24, background: 'var(--gray-100)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / sectorMax) * 100}%`,
                    background: 'linear-gradient(90deg, var(--blue-500), var(--blue-600))',
                    borderRadius: 6,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ width: 60, fontSize: 13, fontWeight: 700, color: 'var(--blue-600)', textAlign: 'right' }}>{count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {gujarat && stageEntries.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header"><h3>Stage Distribution</h3></div>
          <div style={{ padding: '12px 16px' }}>
            {stageEntries.map(([stage, count]) => (
              <div key={stage} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                <div style={{ width: 140, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', textAlign: 'right', flexShrink: 0 }}>{stage}</div>
                <div style={{ flex: 1, height: 24, background: 'var(--gray-100)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${(count / stageMax) * 100}%`,
                    background: STAGE_COLORS[stage] || 'var(--gray-500)',
                    borderRadius: 6,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
                <div style={{ width: 60, fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', textAlign: 'right' }}>{count.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="two-col">
        <div className="card">
          <div className="card-header">
            <h3>At Risk</h3>
            <RiskBadge level={dash.at_risk.length > 0 ? 'High' : 'Low'} />
          </div>
          {dash.at_risk.length === 0 ? (
            <p className="empty" style={{ padding: 16 }}>No projects at risk</p>
          ) : dash.at_risk.map((r, idx) => (
            <div key={r.id || idx} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
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
          <div className="card-header"><h3>Recent Activity</h3></div>
          {dash.recent.length === 0 ? (
            <p className="empty" style={{ padding: 16 }}>No records yet</p>
          ) : dash.recent.map((r, idx) => (
            <div key={r.id || idx} style={{ padding: '10px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{r.kind} · {r.district || 'No district'}</div>
              </div>
              <StageBadge stage={r.stage} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
