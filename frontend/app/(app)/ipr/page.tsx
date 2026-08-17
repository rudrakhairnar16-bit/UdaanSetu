'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';

function StageBadge({ stage }: { stage: string }) {
  const map: Record<string, string> = {
    'idea': 'badge-gray', 'screening': 'badge-orange', 'filed': 'badge-yellow',
    'examination': 'badge-blue', 'granted': 'badge-green', 'rejected': 'badge-red',
  };
  return <span className={`badge ${map[stage.toLowerCase()] || 'badge-gray'}`}>{stage}</span>;
}

const STAGES = ['Idea', 'Screening', 'Filed', 'Examination', 'Granted', 'Rejected'];

export default function IPRPage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [innovations, setInnovations] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Rec | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const [ipr, inn] = await Promise.all([
      api.get<Rec[]>('/records?kind=ipr'),
      api.get<Rec[]>('/records?kind=innovation'),
    ]);
    setRecords(ipr);
    setInnovations(inn);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStage = async (r: Rec, newStage: string) => {
    await api.patch(`/records/${r.id}`, { ...r, stage: newStage });
    setDetail(null);
    load();
  };

  const filtered = records.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>IPR / Patents</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Idea → Screening → Filed → Examination → Granted</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Patent</button>
      </div>

      <input placeholder="Search patents..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 16 }} />

      {/* Lifecycle visualization */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, overflowX: 'auto', padding: '8px 0' }}>
        {STAGES.map((s, i) => {
          const count = records.filter(r => r.stage.toLowerCase() === s.toLowerCase()).length;
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                padding: '10px 18px', borderRadius: 8, fontWeight: 600, fontSize: 13,
                background: ['#f9fafb', '#fff7ed', '#fefce8', '#eff6ff', '#f0fdf4', '#fef2f2'][i],
                color: ['#6b7280', '#9a3412', '#854d0e', '#1e40af', '#166534', '#991b1b'][i],
                whiteSpace: 'nowrap',
              }}>
                {s} <span style={{ opacity: .6 }}>({count})</span>
              </div>
              {i < STAGES.length - 1 && <div style={{ fontSize: 16, color: '#d1d5db', padding: '0 6px' }}>→</div>}
            </div>
          );
        })}
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading...</div> : filtered.length === 0 ? (
        <div className="empty"><div style={{ fontSize: 40 }}>📜</div><p>No patent records found</p></div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Stage</th>
                  <th>Sector</th>
                  <th>District</th>
                  <th>Filing Date</th>
                  <th>Application No.</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>{r.description.slice(0, 60)}...</div>
                    </td>
                    <td><StageBadge stage={r.stage} /></td>
                    <td>{r.sector || '—'}</td>
                    <td>{r.district || '—'}</td>
                    <td>{r.meta.filing_date || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{r.meta.application_no || '—'}</td>
                    <td>
                      <button className="btn btn-sm btn-secondary" onClick={() => setDetail(r)}>Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2>{detail.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetail(null)}>✕</button>
            </div>
            <p style={{ margin: '12px 0', fontSize: 14, color: '#4b5563' }}>{detail.description}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>STAGE</div>
                <div style={{ marginTop: 4 }}><StageBadge stage={detail.stage} /></div>
              </div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>APPLICATION</div>
                <div style={{ fontSize: 15, fontWeight: 600, fontFamily: 'monospace' }}>{detail.meta.application_no || '—'}</div>
              </div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>FILING DATE</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{detail.meta.filing_date || '—'}</div>
              </div>
              <div style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>SECTOR</div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{detail.sector || '—'}</div>
              </div>
            </div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Advance Stage</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {STAGES.filter(s => s !== detail.stage).map(s => (
                <button key={s} className="btn btn-sm btn-secondary" onClick={() => updateStage(detail, s)}>
                  → {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateIPRModal
          innovations={innovations}
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function CreateIPRModal({ innovations, onClose, onCreated }: { innovations: Rec[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', stage: 'Idea', sector: '', district: '', parent_id: '', filing_date: '', application_no: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/records/ipr', {
        title: form.title, description: form.description, stage: form.stage,
        sector: form.sector, district: form.district,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        meta: { filing_date: form.filing_date, application_no: form.application_no },
      });
      onCreated();
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>New Patent Record</h2>
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
                {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Linked Innovation</label>
              <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}>
                <option value="">None</option>
                {innovations.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Sector</label>
              <input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />
            </div>
            <div className="form-group">
              <label>District</label>
              <input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Filing Date</label>
              <input type="date" value={form.filing_date} onChange={e => setForm({ ...form, filing_date: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Application No.</label>
              <input value={form.application_no} onChange={e => setForm({ ...form, application_no: e.target.value })} placeholder="IN/2026/12345" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
