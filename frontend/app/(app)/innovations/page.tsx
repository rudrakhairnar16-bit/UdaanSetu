'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';
import { StageBadge } from '../../components/StageBadge';
import { Modal } from '../../components/Modal';
import { LoadingSpinner, SkeletonCards } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { Button, Input, Select, Breadcrumb, Pagination, PageHeader, Icon } from '../../components/ui';

const PAGE_SIZE = 12;

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [projects, setProjects] = useState<Rec[]>([]);
  const [form, setForm] = useState({ title: '', description: '', stage: 'Concept', district: '', sector: '', parent_id: '', readiness_level: 'TRL 1' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { api.get<Rec[]>('/records?kind=research').then(setProjects); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/records/innovation', {
        title: form.title, description: form.description, stage: form.stage,
        district: form.district, sector: form.sector,
        parent_id: form.parent_id ? Number(form.parent_id) : null,
        meta: { readiness_level: form.readiness_level },
      });
      toast('Innovation created');
      onCreated();
    } catch (err: any) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  return (
    <Modal title="New Innovation" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label>Stage</label>
            <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
              {['Concept', 'Prototype', 'Validation', 'IPR Screening', 'Ready for Market'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label>TRL Level</label>
            <select value={form.readiness_level} onChange={e => setForm({ ...form, readiness_level: e.target.value })}>
              {['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Sector</label><input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="AgriTech..." /></div>
          <div className="form-group"><label>District</label><input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
        </div>
        <div className="form-group"><label>Linked Research Project</label>
          <select value={form.parent_id} onChange={e => setForm({ ...form, parent_id: e.target.value })}>
            <option value="">None</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Innovation'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function InnovationsPage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Rec | null>(null);
  const [editRecord, setEditRecord] = useState<Rec | null>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRecords(await api.get<Rec[]>('/records?kind=innovation'));
    } catch (err: any) {
      setError(err.message || 'Failed to load');
      toast('Failed to load innovations', 'error');
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (r: Rec) => {
    const ok = await confirm(`Delete "${r.title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/records/${r.id}`);
      toast('Innovation deleted');
      setDetail(null);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRecord) return;
    const f = new FormData(e.currentTarget as HTMLFormElement);
    try {
      await api.patch(`/records/${editRecord.id}`, {
        title: f.get('title'), description: f.get('description'), stage: f.get('stage'),
        district: f.get('district'), sector: f.get('sector'),
        meta: { ...editRecord.meta, readiness_level: f.get('readiness_level') },
      });
      toast('Innovation updated');
      setEditRecord(null);
      setDetail(null);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  const filtered = records.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.sector.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        crumb="Innovations"
        title="Innovations"
        subtitle={`${records.length} innovations · Click for AI recommendations`}
        action={<Button onClick={() => setShowCreate(true)} icon={<Icon name="plus" size={16} />}>New Innovation</Button>}
      />

      <div style={{ position: 'relative', maxWidth: 400, marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex', pointerEvents: 'none' }}>
          <Icon name="search" size={16} />
        </span>
        <input
          aria-label="Search innovations"
          placeholder="Search innovations..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {loading ? <SkeletonCards count={4} /> : error ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--red-500)', marginBottom: 12 }}>{error}</p>
          <Button size="sm" onClick={load}>Retry</Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 40, marginBottom: 8 }}>💡</div>
          <p style={{ fontWeight: 700, color: 'var(--gray-600)' }}>No innovations found</p>
          <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Try adjusting your search or create a new innovation.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {paged.map(r => (
              <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => loadAI(r)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{r.title}</div>
                  {r.is_demo && <span className="badge badge-yellow">DEMO</span>}
                </div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 10, lineHeight: 1.5 }}>{r.description.slice(0, 120)}...</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <StageBadge stage={r.stage} />
                  {r.meta.readiness_level && <span className="badge badge-blue">{r.meta.readiness_level}</span>}
                  {r.sector && <span className="badge badge-gray">{r.sector}</span>}
                  {r.district && <span className="badge badge-gray">{r.district}</span>}
                </div>
              </div>
            ))}
          </div>
          {filtered.length > PAGE_SIZE && (
            <Pagination current={safePage} total={totalPages} onChange={setPage} />
          )}
        </div>
      )}

      {/* Detail + AI panel */}
      {detail && !editRecord && (
        <Modal title={detail.title} onClose={() => setDetail(null)} maxWidth={680}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <StageBadge stage={detail.stage} />
            {detail.meta.readiness_level && <span className="badge badge-blue">{detail.meta.readiness_level}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditRecord(detail)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(detail)}>Delete</button>
          </div>
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--gray-600)' }}>{detail.description}</p>

          {recommendations && (
            <div style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>AI Recommendations</h3>
              <div style={{ background: 'var(--green-50)', border: '1px solid var(--green-100)', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>Insight · <span style={{ fontWeight: 600 }}>{recommendations.method}</span></div>
                <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>{recommendations.insight}</p>
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {recommendations.matches?.slice(0, 5).map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-soft)', background: 'var(--surface-soft)' }}>
                    <div>
                      <span className={`badge ${m.type === 'mentor' ? 'badge-blue' : m.type === 'scheme' ? 'badge-green' : 'badge-orange'}`} style={{ marginRight: 8 }}>{m.type}</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</span>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2 }}>{m.reason}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-600)' }}>{m.score}%</div><div style={{ fontSize: 11, color: 'var(--gray-400)' }}>match</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Similar Records</h3>
              {similar.map(s => (
                <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between' }}>
                  <div><span className="badge badge-gray" style={{ marginRight: 8 }}>{s.type}</span><span style={{ fontSize: 14 }}>{s.title}</span></div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-600)' }}>{s.similarity}%</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Edit modal */}
      {editRecord && (
        <Modal title="Edit Innovation" onClose={() => setEditRecord(null)} maxWidth={600}>
          <form onSubmit={handleEditSave}>
            <div className="form-group"><label>Title *</label><input name="title" defaultValue={editRecord.title} required /></div>
            <div className="form-group"><label>Description</label><textarea name="description" defaultValue={editRecord.description} rows={3} /></div>
            <div className="form-row">
              <div className="form-group"><label>Stage</label>
                <select name="stage" defaultValue={editRecord.stage}>
                  {['Concept', 'Prototype', 'Validation', 'IPR Screening', 'Ready for Market'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>TRL Level</label>
                <select name="readiness_level" defaultValue={editRecord.meta.readiness_level || 'TRL 1'}>
                  {['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Sector</label><input name="sector" defaultValue={editRecord.sector} /></div>
              <div className="form-group"><label>District</label><input name="district" defaultValue={editRecord.district} /></div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}
