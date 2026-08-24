'use client';

import { useEffect, useState, useCallback } from 'react';
import { pilots, challenges, payments } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Pilot, Challenge, Payment, PilotMilestone } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

const STATUS_COLORS: Record<string, string> = {
  proposed: '#6b7280', approved: '#012348', in_progress: '#d97706',
  completed: '#b37209', terminated: '#dc2626',
};

export default function PilotsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);
  const [challList, setChallList] = useState<Challenge[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Pilot | null>(null);
  const [milestones, setMilestones] = useState<PilotMilestone[]>([]);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter ? `status=${statusFilter}` : '';
      const [data, ch] = await Promise.all([pilots.list(params), challenges.list('')]);
      setItems(data);
      setChallList(ch);
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const loadMilestones = async (pilotId: number) => {
    try { setMilestones(await pilots.milestones(pilotId)); } catch { setMilestones([]); }
  };

  const handleAction = async (id: number, action: 'start' | 'approve' | 'complete') => {
    if (action === 'start') await pilots.start(id);
    else if (action === 'approve') await pilots.approve(id);
    else await pilots.complete(id);
    toast(`Pilot ${action}d`, 'success');
    load();
  };

  const canCreate = user?.role === 'admin' || user?.role === 'govt_officer';

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Pilots" subtitle="Milestone-based pilot programs" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['', 'proposed', 'approved', 'in_progress', 'completed', 'terminated'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid var(--border)', background: statusFilter === s ? 'var(--accent)' : 'transparent', color: statusFilter === s ? '#fff' : 'var(--text)', fontSize: 13, cursor: 'pointer' }}>
              {s || 'All'}
            </button>
          ))}
        </div>
        {canCreate && <Button onClick={() => setShowCreate(true)}>New Pilot</Button>}
      </div>
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No pilots found</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} onClick={() => { setDetail(item); loadMilestones(item.id); }}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Challenge #{item.challenge_id} → Startup #{item.startup_id}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>{item.duration_weeks} weeks &middot; {item.budget}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (STATUS_COLORS[item.status] || '#6b7280') + '20', color: STATUS_COLORS[item.status] || '#6b7280' }}>{item.status}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.scope}</div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <Modal title="New Pilot" onClose={() => setShowCreate(false)}>
          <PilotForm challenges={challList} onSubmit={async (data) => { await pilots.create(data); toast('Pilot created', 'success'); setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}

      {detail && (
        <Modal title="Pilot Details" onClose={() => { setDetail(null); setMilestones([]); }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Pilot #{detail.id}</h2>
              <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (STATUS_COLORS[detail.status] || '#6b7280') + '20', color: STATUS_COLORS[detail.status] || '#6b7280' }}>{detail.status}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16, lineHeight: 1.6 }}>{detail.scope}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20, fontSize: 13 }}>
              <div><strong>Duration:</strong> {detail.duration_weeks} weeks</div>
              <div><strong>Budget:</strong> {detail.budget}</div>
              <div><strong>Cybersecurity:</strong> {detail.cybersecurity_requirements || 'Standard'}</div>
            </div>
            {milestones.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Milestones</h3>
                <div style={{ display: 'grid', gap: 8 }}>
                  {milestones.map(m => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                      <div>
                        <strong>{m.title}</strong>
                        <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 9999, fontSize: 11, background: m.approval_status === 'approved' ? '#b3720920' : '#d9770620', color: m.approval_status === 'approved' ? '#b37209' : '#d97706' }}>{m.approval_status}</span>
                      </div>
                      <span>{m.payment_amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => { setDetail(null); setMilestones([]); }}>Close</Button>
              {canCreate && detail.status === 'proposed' && <Button onClick={() => handleAction(detail.id, 'approve')} style={{ background: '#012348', color: '#fff' }}>Approve</Button>}
              {canCreate && detail.status === 'approved' && <Button onClick={() => handleAction(detail.id, 'start')} style={{ background: '#d97706', color: '#fff' }}>Start</Button>}
              {canCreate && detail.status === 'in_progress' && <Button onClick={() => handleAction(detail.id, 'complete')} style={{ background: '#b37209', color: '#fff' }}>Complete</Button>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function PilotForm({ challenges: challList, onSubmit, onCancel }: { challenges: Challenge[]; onSubmit: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    challenge_id: challList[0]?.id || '', duration_weeks: 12, scope: '', budget: '',
    cybersecurity_requirements: 'Standard', status: 'proposed',
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>New Pilot</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <select value={form.challenge_id} onChange={e => set('challenge_id', +e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
          {challList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <textarea placeholder="Scope" value={form.scope} onChange={e => set('scope', e.target.value)} rows={4} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input type="number" placeholder="Duration (weeks)" value={form.duration_weeks} onChange={e => set('duration_weeks', +e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
          <input placeholder="Budget (e.g., 500000)" value={form.budget} onChange={e => set('budget', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit({ ...form, challenge_id: +form.challenge_id, startup_id: 1 })}>Create</Button>
      </div>
    </div>
  );
}
