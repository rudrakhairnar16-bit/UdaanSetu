'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Icon } from '../../components/ui';

const COLORS = ['#d4880f', '#1a5296', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#14b8a6'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [districts, setDistricts] = useState<any>(null);
  const [mlMetrics, setMlMetrics] = useState<any>(null);
  const [ecoData, setEcoData] = useState<any>(null);
  const [pipeline, setPipeline] = useState<Record<string, number>>({});
  const [tat, setTat] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = api.getToken();
    if (!token) { setLoading(false); return; }
    Promise.allSettled([
      api.get<any>('/analytics/overview').catch(() => null),
      api.get<any>('/analytics/districts').catch(() => null),
      api.get<any>('/ai/metrics').catch(() => null),
      api.get<any>('/analytics/ecosystem').catch(() => null),
      api.get<Record<string, number>>('/analytics/pipeline-funnel').catch(() => null),
      api.get<Record<string, number>>('/analytics/tat').catch(() => null),
    ]).then(([a, d, ml, eco, p, t]) => {
      if (a.status === 'fulfilled') setData(a.value);
      if (d.status === 'fulfilled') setDistricts(d.value);
      if (ml.status === 'fulfilled') setMlMetrics(ml.value);
      if (eco.status === 'fulfilled') setEcoData(eco.value);
      if (p.status === 'fulfilled' && p.value) setPipeline(p.value);
      if (t.status === 'fulfilled' && t.value) setTat(t.value);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const exportData = async (fmt: 'csv' | 'json') => {
    try {
      const token = api.getToken();
      const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const res = await fetch(`${BASE}/records/export?kind=research&format=${fmt}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `analytics_export.${fmt}`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading analytics...</div>;
  if (!data) return <div style={{ padding: 40, color: '#ef4444' }}>Failed to load analytics</div>;

  const kindData = Object.entries(data.by_kind || {}).map(([n, v]) => ({ name: n.replace(/_/g, ' '), value: Number(v) })).sort((a: any, b: any) => b.value - a.value);
  const sectorData = Object.entries(data.by_sector || {}).map(([n, v]) => ({ name: n, value: Number(v) })).sort((a: any, b: any) => b.value - a.value);
  const sectorTotal = sectorData.reduce((a: number, b: any) => a + b.value, 0) || 1;
  const eco = ecoData || {};

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Platform Analytics</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{data.label || 'Comprehensive analytics'}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => exportData('csv')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="download" size={14} /> CSV
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => exportData('json')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon name="download" size={14} /> JSON
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: data.total_records || 0, color: '#d4880f' },
          { label: 'Research Papers', value: eco.total_research || 0, color: '#1a5296' },
          { label: 'IPR/Patents', value: eco.total_ipr || 0, color: '#f59e0b' },
          { label: 'Innovations', value: eco.total_innovation || 0, color: '#8b5cf6' },
          { label: 'Mentors', value: eco.total_mentors || 0, color: '#06b6d4' },
          { label: 'Schemes', value: eco.total_schemes || 0, color: '#ec4899' },
          { label: 'Incubators', value: eco.total_incubators || 0, color: '#84cc16' },
        ].map(m => (
          <div className="stat-card" key={m.label}>
            <span className="label">{m.label}</span>
            <span className="value" style={{ color: m.color }}>{m.value}</span>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>By Record Type</h3>
        {kindData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={kindData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {kindData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : <p style={{ color: '#9ca3af' }}>No data</p>}
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>By Sector</h3>
        {sectorData.length > 0 ? (
          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
            <div style={{ width: 220, height: 220, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={sectorData.slice(0, 8)} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                    {sectorData.slice(0, 8).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ flex: 1, maxHeight: 220, overflowY: 'auto' }}>
              {sectorData.slice(0, 10).map((s: any, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>{s.value}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, width: 36, textAlign: 'right' }}>{((s.value / sectorTotal) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        ) : <p style={{ color: '#9ca3af' }}>No data</p>}
      </div>

      {(eco.mentor_expertise || []).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Mentors by Expertise</h3>
          {eco.mentor_expertise.map((m: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13 }}>{m.expertise}</span>
              <span style={{ fontSize: 11, background: '#fdecc8', color: '#4a2f03', padding: '2px 8px', borderRadius: 10 }}>{m.count}</span>
            </div>
          ))}
        </div>
      )}

      {(eco.schemes_by_type || []).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Schemes by Type</h3>
          {eco.schemes_by_type.map((s: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13 }}>{s.type}</span>
              <span style={{ fontSize: 11, background: '#dbeafe', color: '#012348', padding: '2px 8px', borderRadius: 10 }}>{s.count}</span>
            </div>
          ))}
        </div>
      )}

      {(eco.incubator_types || []).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Incubators by Type</h3>
          {eco.incubator_types.map((inc: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: 13 }}>{inc.type}</span>
              <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 10 }}>{inc.count}</span>
            </div>
          ))}
        </div>
      )}

      {(eco.top_incubators || []).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Top Incubators</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>Name</th><th>Type</th><th>City</th><th>Focus</th><th>Startups</th><th>Year</th></tr></thead>
              <tbody>
                {eco.top_incubators.slice(0, 15).map((inc: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{inc.name}</td>
                    <td><span style={{ fontSize: 11, background: '#fdecc8', color: '#4a2f03', padding: '2px 8px', borderRadius: 10 }}>{inc.type}</span></td>
                    <td>{inc.city}</td>
                    <td>{(inc.focus_areas || []).join(', ')}</td>
                    <td style={{ fontWeight: 700 }}>{inc.startups_supported}</td>
                    <td>{inc.founded_year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {districts && districts.districts && districts.districts.length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>District Breakdown</h3>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>District</th><th>Research</th><th>Innovation</th><th>IPR</th><th>Startup</th><th>Mentors</th><th>Schemes</th><th>Total</th></tr></thead>
              <tbody>
                {districts.districts.map((d: any) => {
                  const t = (d.research||0)+(d.innovation||0)+(d.ipr||0)+(d.startup||0)+(d.mentor||0)+(d.scheme||0);
                  return (
                    <tr key={d.district}>
                      <td style={{ fontWeight: 600 }}>{d.district}</td>
                      <td>{d.research||0}</td><td>{d.innovation||0}</td><td>{d.ipr||0}</td><td>{d.startup||0}</td><td>{d.mentor||0}</td><td>{d.scheme||0}</td>
                      <td style={{ fontWeight: 700 }}>{t}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {mlMetrics && mlMetrics.risk_model && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            Risk Prediction Model
            <span style={{ marginLeft: 8, fontSize: 11, background: '#fdecc8', color: '#4a2f03', padding: '2px 8px', borderRadius: 10 }}>Trained</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
            {[
              { l: 'ACCURACY', v: `${(mlMetrics.risk_model.accuracy*100).toFixed(1)}%`, c: '#d4880f' },
              { l: 'PRECISION', v: `${(mlMetrics.risk_model.precision*100).toFixed(1)}%`, c: '#1a5296' },
              { l: 'RECALL', v: `${(mlMetrics.risk_model.recall*100).toFixed(1)}%`, c: '#8b5cf6' },
              { l: 'F1 SCORE', v: `${(mlMetrics.risk_model.f1*100).toFixed(1)}%`, c: '#f59e0b' },
              { l: 'AUC-ROC', v: `${(mlMetrics.risk_model.auc_roc*100).toFixed(1)}%`, c: '#ef4444' },
            ].map(m => (
              <div key={m.l} style={{ textAlign: 'center', padding: 10, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600 }}>{m.l}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: m.c, marginTop: 4 }}>{m.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(pipeline).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Pipeline Funnel</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {Object.entries(pipeline).map(([stage, count]) => {
              const maxVal = Math.max(...Object.values(pipeline), 1);
              return (
                <div key={stage}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--gray-600, #4b5563)' }}>{stage.replace(/_/g, ' ')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--gray-900, #111827)' }}>{count}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--gray-100, #f3f4f6)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: '#d4880f',
                      borderRadius: 4,
                      transition: 'width 0.3s',
                      width: `${(count / maxVal) * 100}%`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(tat).length > 0 && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Turnaround Time (Days)</h3>
          <div style={{ display: 'grid', gap: 0 }}>
            {Object.entries(tat).map(([stage, days], i, arr) => (
              <div key={stage} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--gray-50, #f9fafb)' : 'none',
              }}>
                <span style={{ textTransform: 'capitalize', color: 'var(--gray-600, #4b5563)', fontSize: 13 }}>{stage.replace(/_/g, ' ')}</span>
                <span style={{ fontWeight: 600, color: 'var(--gray-900, #111827)' }}>{days} days</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
