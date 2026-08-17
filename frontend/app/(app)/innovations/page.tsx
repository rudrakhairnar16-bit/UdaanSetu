'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    'draft': 'badge-gray', 'concept': 'badge-gray', 'prototype': 'badge-blue',
    'ipr screening': 'badge-orange', 'ready for market': 'badge-green',
    'validation': 'badge-blue', 'completed': 'badge-green',
  };
  return <span className={`badge ${map[stage.toLowerCase()] || 'badge-gray'}`}>{stage}</span>;
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [projects, setProjects] = useState<Rec[]>([]);
  const [form, setForm] = useState({ title: '', description: '', stage: 'Concept', district: '', sector: '', parent_id: '', readiness_level: 'TRL 1' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.get<Rec[]>('/records?kind=research').then(setProjects); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/records/innovation', {
        title: form.title, description: form.description, stage: form.stage,
        district: form.district, sector: form.sector,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        meta: { readiness_level: form.readiness_level },
      });
      onCreated();
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>New Innovation</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Stage</label>
              <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
                {['Concept', 'Prototype', 'Validation', 'IPR Screening', 'Ready for Market'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>TRL Level</label>
              <select value={form.readiness_level} onChange={e => setForm({ ...form, readiness_level: e.target.value })}>
                {['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Sector</label>
              <input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="AgriTech..." />
            </div>
            <div className="form-group">
              <label>District</label>
              <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Linked Research Project</label>
            <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}>
              <option value="">None</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {error && <div style={{ background: '#fef2f2', padding: 10, borderRadius: 8, fontSize: 13, color: '#991b1b', marginBottom: 12 }}>{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Innovation'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InnovationsPage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Rec | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await api.get<Rec[]>('/records?kind=innovation');
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadAI = async (inn: Rec) => {
    setDetail(inn);
    setRecommendations(null);
    setSimilar([]);
    try {
      const [recs, sim] = await Promise.all([
        api.get<any>(`/ai/recommendations/${inn.id}`),
        api.get<any[]>(`/ai/similar/${inn.id}`),
      ]);
      setRecommendations(recs);
      setSimilar(sim);
    } catch {}
  };

  const filtered = records.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.sector.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Innovations</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{records.length} innovations · Click for AI recommendations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Innovation</button>
      </div>

      <input placeholder="Search innovations..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 16 }} />

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div> : filtered.length === 0 ? (
        <div className="empty"><div style={{ fontSize: 40 }}>💡</div><p>No innovations found</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => loadAI(r)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.title}</div>
                {r.is_demo && <span className="badge badge-yellow">DEMO</span>}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{r.description.slice(0, 120)}...</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StageBadge stage={r.stage} />
                {r.meta.readiness_level && <span className="badge badge-blue">{r.meta.readiness_level}</span>}
                {r.sector && <span className="badge badge-gray">{r.sector}</span>}
                {r.district && <span className="badge badge-gray">{r.district}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail + AI panel */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <h2 style={{ marginBottom: 4 }}>{detail.title}</h2>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <StageBadge stage={detail.stage} />
                  {detail.meta.readiness_level && <span className="badge badge-blue">{detail.meta.readiness_level}</span>}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>✕</button>
            </div>
            <p style={{ margin: '12px 0', fontSize: 14, color: '#4b5563' }}>{detail.description}</p>

            {/* AI Recommendations */}
            {recommendations && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>🤖 AI Recommendations</h3>
                <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>
                    Insight · <span style={{ fontWeight: 600 }}>{recommendations.method}</span>
                  </div>
                  <p style={{ fontSize: 14, color: '#374151' }}>{recommendations.insight}</p>
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {recommendations.matches?.slice(0, 5).map((m: any) => (
                    <div key={m.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fafafa',
                    }}>
                      <div>
                        <span className={`badge ${m.type === 'mentor' ? 'badge-blue' : m.type === 'scheme' ? 'badge-green' : 'badge-orange'}`} style={{ marginRight: 8 }}>
                          {m.type}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</span>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{m.reason}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#16a34a' }}>{m.score}%</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>match</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar records */}
            {similar.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>🔍 Similar Records</h3>
                {similar.map(s => (
                  <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span className="badge badge-gray" style={{ marginRight: 8 }}>{s.type}</span>
                      <span style={{ fontSize: 14 }}>{s.title}</span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#16a34a' }}>{s.similarity}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}
