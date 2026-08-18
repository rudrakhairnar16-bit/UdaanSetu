'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';
import { StageBadge } from '../../components/StageBadge';
import { Modal } from '../../components/Modal';
import { LoadingSpinner, SkeletonCards } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', stage: 'Draft', district: '', sector: '', institution: '', funding_required: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/records/research', {
        title: form.title, description: form.description, stage: form.stage,
        district: form.district, sector: form.sector,
        meta: { institution: form.institution, funding_required: Number(form.funding_required) || 0, progress: 0 },
      });
      toast('Research project created');
      onCreated();
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="New Research Project" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label>Stage</label>
            <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
              {['Draft', 'Concept', 'Lab Testing', 'Prototype', 'Field Trial', 'Validation', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Sector</label><input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="AgriTech, CleanTech..." /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>District</label><input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
          <div className="form-group"><label>Institution</label><input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} /></div>
        </div>
        <div className="form-group"><label>Funding Required (₹)</label><input type="number" value={form.funding_required} onChange={e => setForm({ ...form, funding_required: e.target.value })} /></div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Project'}</button>
        </div>
      </form>
    </Modal>
  );
}

function EditModal({ record, onClose, onSaved }: { record: Rec; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    title: record.title, description: record.description, stage: record.stage,
    district: record.district, sector: record.sector,
    institution: record.meta.institution || '', funding_required: String(record.meta.funding_required || ''),
    progress: String(record.meta.progress || 0),
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/records/${record.id}`, {
        title: form.title, description: form.description, stage: form.stage,
        district: form.district, sector: form.sector,
        meta: { ...record.meta, institution: form.institution, funding_required: Number(form.funding_required) || 0, progress: Number(form.progress) || 0 },
      });
      toast('Research project updated');
      onSaved();
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Edit Research Project" onClose={onClose} maxWidth={600}>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
        <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
        <div className="form-row">
          <div className="form-group"><label>Stage</label>
            <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })}>
              {['Draft', 'Concept', 'Lab Testing', 'Prototype', 'Field Trial', 'Validation', 'Completed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Progress (%)</label><input type="number" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Sector</label><input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} /></div>
          <div className="form-group"><label>District</label><input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Institution</label><input value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} /></div>
          <div className="form-group"><label>Funding Required (₹)</label><input type="number" value={form.funding_required} onChange={e => setForm({ ...form, funding_required: e.target.value })} /></div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </form>
    </Modal>
  );
}

function DetailModal({ record, onClose, onEdit, onDelete }: { record: Rec; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const [milestones, setMilestones] = useState<Rec[]>([]);
  const [newMilestone, setNewMilestone] = useState({ title: '', due_date: '', description: '' });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => {
    api.get<Rec[]>(`/records?kind=milestone&parent_id=${record.id}`).then(setMilestones);
  }, [record.id]);

  const addMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/records/milestone', {
        title: newMilestone.title, description: newMilestone.description,
        stage: 'Pending', parent_id: record.id,
        meta: { due_date: newMilestone.due_date, progress: 0 },
      });
      const updated = await api.get<Rec[]>(`/records?kind=milestone&parent_id=${record.id}`);
      setMilestones(updated);
      setNewMilestone({ title: '', due_date: '', description: '' });
      setShowMilestoneForm(false);
      toast('Milestone added');
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async () => {
    const ok = await confirm(`Delete "${record.title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/records/${record.id}`);
      toast('Research project deleted');
      onDelete();
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal title={record.title} onClose={onClose} maxWidth={640}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <StageBadge stage={record.stage} />
        {record.sector && <span className="badge badge-gray">{record.sector}</span>}
        {record.district && <span className="badge badge-gray">{record.district}</span>}
        {record.is_demo && <span className="badge badge-yellow">DEMO DATA</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={onEdit}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
      </div>
      <p style={{ margin: '0 0 16px', fontSize: 14, color: '#4b5563' }}>{record.description}</p>
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
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Milestones ({milestones.length})</h3>
          <button className="btn btn-sm btn-secondary" onClick={() => setShowMilestoneForm(!showMilestoneForm)}>+ Add Milestone</button>
        </div>
        {showMilestoneForm && (
          <form onSubmit={addMilestone} style={{ background: '#f9fafb', padding: 14, borderRadius: 8, marginBottom: 10 }}>
            <div className="form-row">
              <div className="form-group"><label>Title</label><input value={newMilestone.title} onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })} required /></div>
              <div className="form-group"><label>Due Date</label><input type="date" value={newMilestone.due_date} onChange={e => setNewMilestone({ ...newMilestone, due_date: e.target.value })} required /></div>
            </div>
            <div className="form-group"><label>Description</label><input value={newMilestone.description} onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary btn-sm">Save</button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowMilestoneForm(false)}>Cancel</button>
            </div>
          </form>
        )}
        {milestones.map(m => {
          const overdue = m.meta.due_date && !['done', 'completed'].includes(m.stage.toLowerCase()) && m.meta.due_date < today;
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
    </Modal>
  );
}

export default function ResearchPage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState<Rec | null>(null);
  const [detail, setDetail] = useState<Rec | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

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
          <p style={{ fontSize: 13, color: '#6b7280' }}>{records.length} projects · Click to view details</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Project</button>
      </div>

      <input placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 16 }} />

      {loading ? <SkeletonCards count={4} /> : filtered.length === 0 ? (
        <div className="empty"><div style={{ fontSize: 40 }}>🔬</div><p>No research projects found</p></div>
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
                  <div><div style={{ fontSize: 11, color: '#6b7280' }}>Progress</div><div style={{ fontSize: 15, fontWeight: 700 }}>{r.meta.progress || 0}%</div></div>
                  <div><div style={{ fontSize: 11, color: '#6b7280' }}>Funding</div><div style={{ fontSize: 15, fontWeight: 700 }}>₹{((r.meta.funding_required || 0) / 100000).toFixed(1)}L</div></div>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>Updated {new Date(r.updated_at).toLocaleDateString()}</div>
              </div>
              <div style={{ marginTop: 10, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${r.meta.progress || 0}%`, background: '#16a34a', borderRadius: 3, transition: 'width .3s' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
      {editRecord && <EditModal record={editRecord} onClose={() => setEditRecord(null)} onSaved={() => { setEditRecord(null); setDetail(null); load(); }} />}
      {detail && !editRecord && (
        <DetailModal
          record={detail}
          onClose={() => setDetail(null)}
          onEdit={() => { setEditRecord(detail); setDetail(null); }}
          onDelete={() => { setDetail(null); load(); }}
        />
      )}
    </div>
  );
}
