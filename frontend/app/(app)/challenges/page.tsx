'use client';

import { useEffect, useState, useCallback } from 'react';
import { challenges, departments } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Challenge, Department } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280', open: '#012348', in_progress: '#d97706',
  evaluating: '#7c3aed', awarded: '#b37209', closed: '#dc2626',
};

export default function ChallengesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Challenge | null>(null);
  const [detail, setDetail] = useState<Challenge | null>(null);
  const [depts, setDepts] = useState<Department[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `status=${statusFilter}` : '';
      const [data, deptData] = await Promise.all([
        challenges.list(params),
        departments.list(''),
      ]);
      setItems(data);
      setDepts(deptData);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    await challenges.create(data);
    toast('Challenge created', 'success');
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (data: any) => {
    if (!editItem) return;
    await challenges.update(editItem.id, data);
    toast('Challenge updated', 'success');
    setEditItem(null);
    load();
  };

  const handleDelete = async (item: Challenge) => {
    if (!await confirm('Delete this challenge?')) return;
    await challenges.delete(item.id);
    toast('Challenge deleted', 'success');
    load();
  };

  const handlePublish = async (item: Challenge) => {
    await challenges.publish(item.id);
    toast('Challenge published', 'success');
    load();
  };

  const canCreate = user?.role === 'admin' || user?.role === 'govt_officer';

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Challenges" subtitle="Government procurement challenges" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['', 'draft', 'open', 'in_progress', 'evaluating', 'awarded', 'closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: statusFilter === s ? 'var(--accent)' : 'transparent', color: statusFilter === s ? '#fff' : 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
              {s || 'All'}
            </button>
          ))}
        </div>
        {canCreate && <Button onClick={() => setShowCreate(true)}>New Challenge</Button>}
      </div>
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No challenges found</div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} onClick={() => setDetail(item)}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, cursor: 'pointer', transition: 'border-color .15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{item.category} &middot; {item.sector || 'All Sectors'}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: STATUS_COLORS[item.status] + '20', color: STATUS_COLORS[item.status] }}>
                  {item.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.description}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--gray-500)' }}>
                <span>Budget: {item.budget_range || 'TBD'}</span>
                <span>Timeline: {item.timeline_weeks || '?'} weeks</span>
                <span>{item.district}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showCreate || editItem) && (
        <Modal title={editItem ? 'Edit Challenge' : 'New Challenge'} onClose={() => { setShowCreate(false); setEditItem(null); }}>
          <ChallengeForm initial={editItem} departments={depts} onSubmit={editItem ? handleUpdate : handleCreate} onCancel={() => { setShowCreate(false); setEditItem(null); }} />
        </Modal>
      )}

      {detail && (
        <Modal title="Challenge Details" onClose={() => setDetail(null)}>
          <ChallengeDetail item={detail} departments={depts} onClose={() => setDetail(null)}
            onEdit={() => { setEditItem(detail); setDetail(null); }}
            onDelete={() => handleDelete(detail)}
            onPublish={() => handlePublish(detail)}
            canEdit={canCreate} />
        </Modal>
      )}
    </div>
  );
}

function ChallengeForm({ initial, departments, onSubmit, onCancel }: { initial: Challenge | null; departments: Department[]; onSubmit: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || '', description: initial?.description || '', category: initial?.category || 'digital',
    department_id: initial?.department_id || '', status: initial?.status || 'draft', budget_range: initial?.budget_range || '',
    timeline_weeks: initial?.timeline_weeks || 12, district: initial?.district || 'Pune', sector: initial?.sector || '',
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{initial ? 'Edit Challenge' : 'New Challenge'}</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Title" value={form.title} onChange={e => set('title', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        <textarea placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <select value={form.category} onChange={e => set('category', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
            <option value="digital">Digital</option><option value="health">Health</option><option value="education">Education</option>
            <option value="agriculture">Agriculture</option><option value="infrastructure">Infrastructure</option><option value="governance">Governance</option>
          </select>
          <select value={form.department_id} onChange={e => set('department_id', e.target.value || null)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
            <option value="">Select Department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="Budget Range (e.g., 10L-50L)" value={form.budget_range} onChange={e => set('budget_range', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
          <input type="number" placeholder="Timeline (weeks)" value={form.timeline_weeks} onChange={e => set('timeline_weeks', +e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="District" value={form.district} onChange={e => set('district', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
          <input placeholder="Sector" value={form.sector} onChange={e => set('sector', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit({ ...form, department_id: form.department_id ? +form.department_id : null })}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
}

function ChallengeDetail({ item, departments, onClose, onEdit, onDelete, onPublish, canEdit }: { item: Challenge; departments: Department[]; onClose: () => void; onEdit: () => void; onDelete: () => void; onPublish: () => void; canEdit: boolean }) {
  const dept = departments.find(d => d.id === item.department_id);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>{item.title}</h2>
        <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (STATUS_COLORS[item.status] || '#6b7280') + '20', color: STATUS_COLORS[item.status] || '#6b7280' }}>{item.status}</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16, lineHeight: 1.6 }}>{item.description}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 13 }}>
        <div><strong>Category:</strong> {item.category}</div>
        <div><strong>Department:</strong> {dept?.name || 'N/A'}</div>
        <div><strong>Budget:</strong> {item.budget_range || 'TBD'}</div>
        <div><strong>Timeline:</strong> {item.timeline_weeks} weeks</div>
        <div><strong>District:</strong> {item.district}</div>
        <div><strong>Sector:</strong> {item.sector || 'All'}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onClick={onClose}>Close</Button>
        {canEdit && item.status === 'draft' && <Button onClick={onPublish} style={{ background: '#b37209', color: '#fff' }}>Publish</Button>}
        {canEdit && <Button onClick={onEdit}>Edit</Button>}
        {canEdit && <Button variant="ghost" onClick={onDelete} style={{ color: '#dc2626' }}>Delete</Button>}
      </div>
    </div>
  );
}
