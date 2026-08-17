'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    'draft': 'badge-gray', 'prototype': 'badge-blue', 'lab testing': 'badge-blue',
    'field trial': 'badge-blue', 'validation': 'badge-blue', 'stalled': 'badge-red',
    'at risk': 'badge-red', 'completed': 'badge-green',
  };
  return <span className={`badge ${map[stage.toLowerCase()] || 'badge-gray'}`}>{stage}</span>;
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', stage: 'Draft', district: '', sector: '', institution: '', funding_required: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/records/research', {
        title: form.title,
        description: form.description,
        stage: form.stage,
        district: form.district,
        sector: form.sector,
        meta: {
          institution: form.institution,
          funding_required: Number(form.funding_required) || 0,
          progress: 0,
        },
      });
      onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>New Research Project</h2>
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
                {['Draft', 'Concept', 'Lab Testing', 'Prototype', 'Field Trial', 'Validation', 'Completed'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Sector</label>
              <input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="AgriTech, CleanTech..." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>District</label>
              <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Institution</label>
              <input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Funding Required (₹)</label>
            <input type="number" value={form.funding_required} onChange={e => setForm({ ...form, funding_required: e.target.value })} />
          </div>
          {error && <div style={{ background: '#fef2f2', padding: 10, borderRadius: 8, fontSize: 13, color: '#991b1b', marginBottom: 12 }}>{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DetailModal({ record, onClose }: { record: Rec; onClose: () => void }) {
  const [milestones, setMilestones] = useState<Rec[]>([]);
  const [innovations, setInnovations] = useState<Rec[]>([]);
  const [newMilestone, setNewMilestone] = useState({ title: '', due_date: '', description: '' });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);

  useEffect(() => {
    api.get<Rec[]>(`/records?kind=milestone&parent_id=${record.id}`).then(setMilestones);
    api.get<Rec[]>(`/records?kind=innovation&parent_id=${record.id}`).then(setInnovations);
  }, [record.id]);

  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/records/milestone', {
      title: newMilestone.title,
      description: newMilestone.description,
      stage: 'Pending',
      parent_id: record.id,
      meta: { due_date: newMilestone.due_date, progress: 0 },
    });
    const updated = await api.get<Rec[]>(`/records?kind=milestone&parent_id=${record.id}`);
    setMilestones(updated);
    setNewMilestone({ title: '', due_date: '', description: '' });
    setShowMilestoneForm(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 640 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ marginBottom: 4 }}>{record.title}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
              <StageBadge stage={record.stage} />
              <span className="badge badge-gray">{record.sector || 'General'}</span>
              <span className="badge badge-gray">{record.district || '—'}</span>
              {record.is_demo && <span className="badge badge-yellow">DEMO DATA</span>}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <p style={{ margin: '14px 0', fontSize: 14, color: '#4b5563' }}>{record.description}</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>PROGRESS</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#166534' }}>{record.meta.progress || 0}%</div>
          </div>
          <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>FUNDING</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#166534' }}>₹{((record.meta.funding_required || 0) / 100000).toFixed(1)}L</div>
          </div>
          <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>INSTITUTION</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{record.meta.institution || '—'}</div>
          </div>
        </div>

        {/* Milestones */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Milestones ({milestones.length})</h3>
            <button className="btn btn-sm btn-secondary" onClick={() => setShowMilestoneForm(!showMilestoneForm)}>
              + Add Milestone
            </button>
          </div>
          {showMilestoneForm && (
            <form onSubmit={addMilestone} style={{ background: '#f9fafb', padding: 14, borderRadius: 8, marginBottom: 10 }}>
              <div className="form-row">
                <div className="form-group">
                  <label>Title</label>
                  <input value={newMilestone.title} onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={newMilestone.due_date} onChange={e => setNewMilestone({ ...newMilestone, due_date: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={newMilestone.description} onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm">Save</button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMilestoneForm(false)}>Cancel</button>
              </div>
            </form>
          )}
          {milestones.map(m => {
            const overdue = m.meta.due_date && m.stage.toLowerCase() !== 'done' && m.stage.toLowerCase() !== 'completed' && m.meta.due_date < today;
            return (
              <div key={m.id} style={{
                padding: '10px 14px', borderRadius: 8, marginBottom: 6,
                background: overdue ? '#fef2f2' : '#f9fafb',
                border: `1px solid ${overdue ? '#fecaca' : '#e5e7eb'}`,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Due: {m.meta.due_date || '—'} · Progress: {m.meta.progress || 0}%
                    {overdue && <span style={{ color: '#ef4444', fontWeight: 600 }}> · OVERDUE</span>}
                  </div>
                </div>
                <StageBadge stage={m.stage} />
              </div>
            );
          })}
          {milestones.length === 0 && <p style={{ fontSize: 13, color: '#9ca3af' }}>No milestones yet.</p>}
        </div>

        {/* Linked innovations */}
        {innovations.length > 0 && (
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Linked Innovations</h3>
            {innovations.map(inn => (
              <div key={inn.id} style={{ padding: '8px 14px', background: '#f0fdf4', borderRadius: 8, marginBottom: 6, border: '1px solid #dcfce7' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{inn.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{inn.stage} · {inn.sector}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResearchPage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Rec | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await api.get<Rec[]>('/records?kind=research');
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = records.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.sector.toLowerCase().includes(search.toLowerCase()) ||
    r.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Research Projects</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{records.length} projects · Click a project to view details and milestones</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Search projects..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 400 }}
        />
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 40 }}>🔬</div>
          <p>No research projects found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setDetail(r)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>{r.description.slice(0, 100)}...</div>
                </div>
                {r.is_demo && <span className="badge badge-yellow" style={{ flexShrink: 0 }}>DEMO</span>}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <StageBadge stage={r.stage} />
                {r.sector && <span className="badge badge-gray">{r.sector}</span>}
                {r.district && <span className="badge badge-gray">{r.district}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>Progress</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{r.meta.progress || 0}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>Funding</div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>₹{((r.meta.funding_required || 0) / 100000).toFixed(1)}L</div>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Updated {new Date(r.updated_at).toLocaleDateString()}</div>
              </div>
              {/* Progress bar */}
              <div style={{ marginTop: 10, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.meta.progress || 0}%`, background: '#16a34a', borderRadius: 3, transition: 'width .3s' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
      {detail && <DetailModal record={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
