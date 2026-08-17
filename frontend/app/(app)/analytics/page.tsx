'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Analytics, AIMetrics } from '../../lib/types';

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [districts, setDistricts] = useState<any>(null);
  const [mlMetrics, setMlMetrics] = useState<AIMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<Analytics>('/analytics/overview'),
      api.get<any>('/analytics/districts'),
      api.get<AIMetrics>('/ai/metrics').catch(() => null),
    ])
      .then(([a, d, ml]) => { setData(a); setDistricts(d); setMlMetrics(ml); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading analytics...</div>;
  if (!data) return <div style={{ padding: 40, color: '#ef4444' }}>Failed to load analytics</div>;

  const kindEntries = Object.entries(data.by_kind) as [string, number][];
  const sectorEntries = Object.entries(data.by_sector) as [string, number][];
  const maxKind = Math.max(...kindEntries.map(([, v]) => v), 1);
  const maxSector = Math.max(...sectorEntries.map(([, v]) => v), 1);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Platform Analytics</h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>{data.label}</p>
      </div>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Records', value: data.total_records },
          { label: 'Avg Progress', value: `${data.avg_research_progress}%` },
          { label: 'Funding Required', value: `₹${(data.total_funding_required / 100000).toFixed(1)}L` },
          { label: 'Startup Revenue', value: `₹${(data.total_startup_revenue / 100000).toFixed(1)}L` },
          { label: 'Jobs Created', value: data.total_jobs_created },
          { label: 'Farmers Reached', value: data.total_farmers_reached.toLocaleString() },
        ].map(m => (
          <div className="stat-card" key={m.label}>
            <span className="label">{m.label}</span>
            <span className="value">{m.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* By kind */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>By Record Type</h3>
          {kindEntries.sort(([, a], [, b]) => b - a).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, textTransform: 'capitalize' }}>{k.replace('_', ' ')}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
              </div>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(v / maxKind) * 100}%`, background: '#16a34a', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* By sector */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>By Sector</h3>
          {sectorEntries.sort(([, a], [, b]) => b - a).map(([k, v]) => (
            <div key={k} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{v}</span>
              </div>
              <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(v / maxSector) * 100}%`, background: '#3b82f6', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* District breakdown */}
      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>District Breakdown</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>District</th>
                <th>Research</th>
                <th>Innovation</th>
                <th>IPR</th>
                <th>Startup</th>
                <th>Mentors</th>
                <th>Schemes</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {districts?.districts?.map((d: any) => {
                const total = Object.values(d).reduce((a: number, v: any) => a + (typeof v === 'number' ? v : 0), 0) - 1;
                return (
                  <tr key={d.district}>
                    <td style={{ fontWeight: 600 }}>{d.district}</td>
                    <td>{d.research || 0}</td>
                    <td>{d.innovation || 0}</td>
                    <td>{d.ipr || 0}</td>
                    <td>{d.startup || 0}</td>
                    <td>{d.mentor || 0}</td>
                    <td>{d.scheme || 0}</td>
                    <td style={{ fontWeight: 700 }}>{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ML Model Metrics */}
      {mlMetrics && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
          {/* Risk Model */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              🧠 Risk Prediction Model
              {mlMetrics.risk_model && (
                <span className="badge badge-green" style={{ marginLeft: 8, fontSize: 11 }}>Trained</span>
              )}
            </h3>
            {mlMetrics.risk_model ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                  {[
                    { label: 'Accuracy', value: `${(mlMetrics.risk_model.accuracy * 100).toFixed(1)}%`, color: '#16a34a' },
                    { label: 'Precision', value: `${(mlMetrics.risk_model.precision * 100).toFixed(1)}%`, color: '#3b82f6' },
                    { label: 'Recall', value: `${(mlMetrics.risk_model.recall * 100).toFixed(1)}%`, color: '#8b5cf6' },
                    { label: 'F1 Score', value: `${(mlMetrics.risk_model.f1 * 100).toFixed(1)}%`, color: '#f59e0b' },
                    { label: 'AUC-ROC', value: `${(mlMetrics.risk_model.auc_roc * 100).toFixed(1)}%`, color: '#ef4444' },
                    { label: 'Training Samples', value: mlMetrics.risk_model.training_samples, color: '#6b7280' },
                  ].map(m => (
                    <div key={m.label} style={{ textAlign: 'center', padding: 10, background: '#f9fafb', borderRadius: 8 }}>
                      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{m.label.toUpperCase()}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: m.color, marginTop: 4 }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                {/* Feature importance */}
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Feature Importance</h4>
                {mlMetrics.risk_model.feature_names.slice(0, 5).map((name, i) => {
                  const importance = mlMetrics.risk_model!.confusion_matrix[0] ? 0 : 0;
                  return (
                    <div key={name} style={{ marginBottom: 6 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 12, textTransform: 'capitalize' }}>{name.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
                  Algorithm: Gradient Boosting · Trained: {new Date(mlMetrics.risk_model.trained_at).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>Model not trained yet</div>
            )}
          </div>

          {/* Semantic Engine */}
          <div className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              🔍 Semantic Search Engine
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>MODEL</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6', marginTop: 4 }}>
                  {mlMetrics.semantic_engine.model}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: 12, background: '#f9fafb', borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>CORPUS SIZE</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#374151', marginTop: 4 }}>
                  {mlMetrics.semantic_engine.corpus_size} docs
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 12, background: mlMetrics.semantic_engine.ready ? '#f0fdf4' : '#fef2f2', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: mlMetrics.semantic_engine.ready ? '#16a34a' : '#ef4444' }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{mlMetrics.semantic_engine.ready ? 'Ready' : 'Not initialized'}</span>
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>
              Powers: recommendations, similar records, duplicate detection
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
