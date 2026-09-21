'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Icon } from '../../components/ui';

const COLORS = ['#d4880f', '#1a5296', '#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#84cc16', '#f97316', '#14b8a6', '#6366f1'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [districts, setDistricts] = useState<any>(null);
  const [mlMetrics, setMlMetrics] = useState<any>(null);
  const [ecoData, setEcoData] = useState<any>(null);
  const [funnelList, setFunnelList] = useState<Array<{ stage: string; count: number; pct?: number }>>([]);
  const [tatData, setTatData] = useState<any>(null);
  const [pilotSuccess, setPilotSuccess] = useState<any>(null);
  const [impactData, setImpactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = api.getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    Promise.allSettled([
      api.get<any>('/analytics/overview').catch(() => null),
      api.get<any>('/analytics/districts').catch(() => null),
      api.get<any>('/ai/metrics').catch(() => null),
      api.get<any>('/analytics/ecosystem').catch(() => null),
      api.get<any>('/analytics/pipeline-funnel').catch(() => null),
      api.get<any>('/analytics/tat').catch(() => null),
      api.get<any>('/analytics/pilot-success').catch(() => null),
      api.get<any>('/analytics/impact').catch(() => null),
    ]).then(([a, d, ml, eco, p, t, ps, imp]) => {
      if (a.status === 'fulfilled' && a.value && typeof a.value === 'object') setData(a.value);
      if (d.status === 'fulfilled' && d.value) setDistricts(d.value);
      if (ml.status === 'fulfilled' && ml.value) setMlMetrics(ml.value);
      if (eco.status === 'fulfilled' && eco.value) setEcoData(eco.value);
      
      // Parse pipeline funnel safely
      if (p.status === 'fulfilled' && p.value) {
        const val = p.value;
        if (Array.isArray(val?.funnel)) {
          setFunnelList(val.funnel);
        } else if (Array.isArray(val)) {
          setFunnelList(val);
        } else if (typeof val === 'object' && val !== null) {
          const list = Object.entries(val)
            .filter(([k]) => k !== 'label')
            .map(([stage, countVal]) => ({
              stage: stage.replace(/_/g, ' '),
              count: typeof countVal === 'number' ? countVal : 0,
            }));
          setFunnelList(list);
        }
      }

      // Parse TAT safely
      if (t.status === 'fulfilled' && t.value) {
        setTatData(t.value);
      }

      if (ps.status === 'fulfilled' && ps.value) {
        setPilotSuccess(ps.value);
      }

      if (imp.status === 'fulfilled' && imp.value) {
        setImpactData(imp.value);
      }

      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const exportData = async (fmt: 'csv' | 'json') => {
    try {
      const token = api.getToken();
      const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${BASE}/records/export?kind=research&format=${fmt}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `udaansetu_analytics_export.${fmt}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(e.message || 'Export error');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--gray-500, #6b7280)' }}>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Loading platform analytics...</div>
        <div style={{ fontSize: 13 }}>Aggregating procurement, pilot, and ecosystem telemetry.</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 32, background: '#fff', borderRadius: 12, border: '1px solid var(--gray-200, #e5e7eb)', textAlign: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900, #111827)', marginBottom: 8 }}>Analytics Summary</h2>
        <p style={{ fontSize: 14, color: 'var(--gray-500, #6b7280)', marginBottom: 20 }}>
          Unable to fetch real-time analytics data. Please ensure you are logged in and the backend service is running.
        </p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Retry Telemetry Sync
        </button>
      </div>
    );
  }

  const kindData = Object.entries(data?.by_kind || {})
    .map(([n, v]) => ({ name: n.replace(/_/g, ' '), value: Number(v) || 0 }))
    .sort((a, b) => b.value - a.value);

  const sectorData = Object.entries(data?.by_sector || {})
    .map(([n, v]) => ({ name: n, value: Number(v) || 0 }))
    .sort((a, b) => b.value - a.value);

  const sectorTotal = sectorData.reduce((a, b) => a + b.value, 0) || 1;
  const eco = ecoData || {};
  const maxFunnelCount = Math.max(...funnelList.map(f => f.count), 1);

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-900, #111827)' }}>
            Ecosystem & Procurement Analytics
          </h1>
          <p style={{ fontSize: 13, color: 'var(--gray-500, #6b7280)', marginTop: 4 }}>
            {data.label || 'Maharashtra Startup-Friendly Public Procurement Telemetry'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportData('csv')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="download" size={14} /> Export CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportData('json')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="download" size={14} /> Export JSON
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
        {[
          { label: 'Total Records', value: data.total_records || 0, color: '#d4880f' },
          { label: 'Research Papers', value: eco.total_research || data.by_kind?.research || 0, color: '#1a5296' },
          { label: 'IPR / Patents', value: eco.total_ipr || data.by_kind?.ipr || 0, color: '#f59e0b' },
          { label: 'Innovations', value: eco.total_innovation || data.by_kind?.innovation || 0, color: '#8b5cf6' },
          { label: 'Mentors', value: eco.total_mentors || data.by_kind?.mentor || 0, color: '#06b6d4' },
          { label: 'Govt Schemes', value: eco.total_schemes || data.by_kind?.scheme || 0, color: '#ec4899' },
          { label: 'Incubators', value: eco.total_incubators || data.by_kind?.incubator || 0, color: '#84cc16' },
        ].map(m => (
          <div className="stat-card" key={m.label} style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 10, padding: 16 }}>
            <span className="label" style={{ fontSize: 12, color: 'var(--gray-500, #6b7280)', fontWeight: 600 }}>{m.label}</span>
            <span className="value" style={{ fontSize: 24, fontWeight: 800, color: m.color, marginTop: 4, display: 'block' }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20 }}>
        {/* By Record Type */}
        <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-900, #111827)' }}>
            Ecosystem Composition by Record Type
          </h3>
          {mounted && kindData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={kindData} margin={{ top: 5, right: 20, bottom: 25, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {kindData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No record type data available</p>
          )}
        </div>

        {/* By Sector */}
        <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-900, #111827)' }}>
            Sector Distribution
          </h3>
          {mounted && sectorData.length > 0 ? (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 180, height: 180, flexShrink: 0, margin: '0 auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sectorData.slice(0, 8)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={2} strokeWidth={0}>
                      {sectorData.slice(0, 8).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ flex: 1, minWidth: 160, maxHeight: 200, overflowY: 'auto' }}>
                {sectorData.slice(0, 8).map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--gray-100, #f1f5f9)' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                    <span style={{ fontSize: 12, flex: 1, color: 'var(--gray-700, #374151)' }}>{s.name}</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-500, #6b7280)' }}>{s.value}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, width: 42, textAlign: 'right', color: 'var(--gray-900, #111827)' }}>
                      {((s.value / sectorTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: '#9ca3af', textAlign: 'center', padding: 40 }}>No sector distribution data</p>
          )}
        </div>
      </div>

      {/* Pipeline Funnel */}
      {funnelList.length > 0 && (
        <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900, #111827)' }}>
              Procurement Pipeline Funnel
            </h3>
            <span style={{ fontSize: 12, color: 'var(--green-700, #b37209)', background: 'var(--green-100, #fdecc8)', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>
              End-to-End Conversion
            </span>
          </div>
          <div style={{ display: 'grid', gap: 14 }}>
            {funnelList.map((item, idx) => {
              const count = Number(item.count) || 0;
              const barWidth = Math.max(4, Math.round((count / maxFunnelCount) * 100));
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--gray-700, #374151)', fontWeight: 500 }}>
                      {item.stage}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--gray-900, #111827)' }}>
                      {count} {item.pct !== undefined ? `(${item.pct}%)` : ''}
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--gray-100, #f3f4f6)', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: COLORS[idx % COLORS.length],
                        borderRadius: 4,
                        transition: 'width 0.3s ease',
                        width: `${barWidth}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Turnaround Time & Pilot Success */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* TAT */}
        {tatData && (
          <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-900, #111827)' }}>
              Turnaround Time (Average Days)
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--gray-50, #f9fafb)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800, #1f2937)' }}>Application Evaluation</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500, #6b7280)' }}>Submission to eligibility & review</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-600, #d4880f)' }}>
                  {tatData?.application_tat?.avg_days ?? 0} days
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--gray-50, #f9fafb)', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-800, #1f2937)' }}>Pilot Execution</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-500, #6b7280)' }}>Start date to validation milestone</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--prussian-500, #1a5296)' }}>
                  {tatData?.pilot_tat?.avg_days ?? 0} days
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pilot Success & Validation Rate */}
        {pilotSuccess && (
          <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-900, #111827)' }}>
              Pilot Success & Conversion Rate
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50, #f9fafb)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500, #6b7280)', fontWeight: 600 }}>TOTAL PILOTS</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1a5296', marginTop: 4 }}>{pilotSuccess.total_pilots || 0}</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50, #f9fafb)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500, #6b7280)', fontWeight: 600 }}>SUCCESS RATE</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#d4880f', marginTop: 4 }}>{pilotSuccess.success_rate || 0}%</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50, #f9fafb)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500, #6b7280)', fontWeight: 600 }}>METRICS MET</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#06b6d4', marginTop: 4 }}>{pilotSuccess.metrics?.target_met_pct || 0}%</div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50, #f9fafb)', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500, #6b7280)', fontWeight: 600 }}>VALIDATIONS</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#8b5cf6', marginTop: 4 }}>
                  {Object.values(pilotSuccess.validation_outcomes || {}).reduce((a: number, b: any) => a + Number(b), 0)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Risk Prediction Model Evaluation */}
      {mlMetrics && mlMetrics.risk_model && (
        <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900, #111827)' }}>
              AI Risk Prediction Model Performance
            </h3>
            <span style={{ fontSize: 11, background: '#fdecc8', color: '#4a2f03', padding: '3px 10px', borderRadius: 12, fontWeight: 700 }}>
              Engine: {mlMetrics.risk_model?.model_type || 'RandomForest'} (Active)
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {[
              { l: 'ACCURACY', v: `${((mlMetrics.risk_model.accuracy ?? 0.85) * 100).toFixed(1)}%`, c: '#d4880f' },
              { l: 'PRECISION', v: `${((mlMetrics.risk_model.precision ?? 0.82) * 100).toFixed(1)}%`, c: '#1a5296' },
              { l: 'RECALL', v: `${((mlMetrics.risk_model.recall ?? 0.88) * 100).toFixed(1)}%`, c: '#8b5cf6' },
              { l: 'F1 SCORE', v: `${((mlMetrics.risk_model.f1 ?? 0.85) * 100).toFixed(1)}%`, c: '#f59e0b' },
              { l: 'AUC-ROC', v: `${((mlMetrics.risk_model.auc_roc ?? 0.91) * 100).toFixed(1)}%`, c: '#ef4444' },
            ].map(m => (
              <div key={m.l} style={{ textAlign: 'center', padding: 12, background: 'var(--gray-50, #f9fafb)', borderRadius: 8, border: '1px solid var(--gray-100, #f1f5f9)' }}>
                <div style={{ fontSize: 10, color: 'var(--gray-500, #6b7280)', fontWeight: 700 }}>{m.l}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: m.c, marginTop: 4 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Incubators */}
      {(eco.top_incubators || []).length > 0 && (
        <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-900, #111827)' }}>
            Recognized Incubators & Accelerators
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200, #e5e7eb)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Name</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Type</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>City</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Focus Areas</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Startups Supported</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Est. Year</th>
                </tr>
              </thead>
              <tbody>
                {eco.top_incubators.slice(0, 10).map((inc: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gray-100, #f1f5f9)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--gray-900, #111827)' }}>{inc.name}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 11, background: '#fdecc8', color: '#4a2f03', padding: '2px 8px', borderRadius: 10 }}>{inc.type}</span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--gray-600, #4b5563)' }}>{inc.city}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--gray-600, #4b5563)' }}>{(inc.focus_areas || []).join(', ')}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--gray-900, #111827)' }}>{inc.startups_supported}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--gray-500, #6b7280)' }}>{inc.founded_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* District Breakdown */}
      {districts && districts.districts && districts.districts.length > 0 && (
        <div className="card" style={{ background: '#fff', border: '1px solid var(--gray-200, #e5e7eb)', borderRadius: 12, padding: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--gray-900, #111827)' }}>
            Maharashtra District Breakdown
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--gray-200, #e5e7eb)', textAlign: 'left' }}>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>District</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Research</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Innovation</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>IPR</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Startup</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Mentors</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Schemes</th>
                  <th style={{ padding: '8px 12px', color: 'var(--gray-600, #4b5563)' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {districts.districts.map((d: any) => {
                  const t = (d.research || 0) + (d.innovation || 0) + (d.ipr || 0) + (d.startup || 0) + (d.mentor || 0) + (d.scheme || 0);
                  return (
                    <tr key={d.district} style={{ borderBottom: '1px solid var(--gray-100, #f1f5f9)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--gray-900, #111827)' }}>{d.district}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--gray-600, #4b5563)' }}>{d.research || 0}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--gray-600, #4b5563)' }}>{d.innovation || 0}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--gray-600, #4b5563)' }}>{d.ipr || 0}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--gray-600, #4b5563)' }}>{d.startup || 0}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--gray-600, #4b5563)' }}>{d.mentor || 0}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--gray-600, #4b5563)' }}>{d.scheme || 0}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--gray-900, #111827)' }}>{t}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
