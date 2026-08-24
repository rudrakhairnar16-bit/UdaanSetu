'use client';

import { useEffect, useState, useCallback } from 'react';
import { challenges, applications } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Application, Challenge } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280', submitted: '#012348', under_review: '#d97706', eligible: '#b37209', ineligible: '#dc2626', shortlisted: '#7c3aed', rejected: '#dc2626', accepted: '#b37209',
};

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Application[]>([]);
  const [challList, setChallList] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Application | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, ch] = await Promise.all([applications.list(''), challenges.list('')]);
      setItems(data);
      setChallList(ch);
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Applications" subtitle="Startup challenge applications" />
      {user?.role === 'startup' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <Button onClick={() => setShowCreate(true)}>New Application</Button>
        </div>
      )}
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No applications found</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} onClick={() => setDetail(item)}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Challenge #{item.challenge_id} → Startup #{item.startup_id}</div>
                <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (STATUS_COLORS[item.status] || '#6b7280') + '20', color: STATUS_COLORS[item.status] || '#6b7280' }}>{item.status}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.proposal || 'No proposal yet'}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--gray-500)' }}>
                <span>Budget: {item.proposed_budget || 'TBD'}</span>
                <span>Timeline: {item.proposed_timeline_weeks} weeks</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {showCreate && (
        <Modal title="New Application" onClose={() => setShowCreate(false)}>
          <ApplicationForm challenges={challList} onSubmit={async (data) => { await applications.create(data); toast('Application submitted', 'success'); setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />
        </Modal>
      )}
      {detail && (
        <Modal title={`Application #${detail.id}`} onClose={() => setDetail(null)}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Application #{detail.id}</h2>
            <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16, lineHeight: 1.6 }}>{detail.proposal}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, fontSize: 13 }}>
              <div><strong>Challenge:</strong> #{detail.challenge_id}</div>
              <div><strong>Status:</strong> {detail.status}</div>
              <div><strong>Budget:</strong> {detail.proposed_budget}</div>
              <div><strong>Timeline:</strong> {detail.proposed_timeline_weeks} weeks</div>
            </div>
            <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ApplicationForm({ challenges: challList, onSubmit, onCancel }: { challenges: Challenge[]; onSubmit: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ challenge_id: challList[0]?.id || '', proposal: '', proposed_budget: '', proposed_timeline_weeks: 12 });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>New Application</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <select value={form.challenge_id} onChange={e => set('challenge_id', +e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
          {challList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        <textarea placeholder="Your proposal" value={form.proposal} onChange={e => set('proposal', e.target.value)} rows={6} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="Proposed budget" value={form.proposed_budget} onChange={e => set('proposed_budget', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
          <input type="number" placeholder="Timeline (weeks)" value={form.proposed_timeline_weeks} onChange={e => set('proposed_timeline_weeks', +e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit({ ...form, challenge_id: +form.challenge_id })}>Submit</Button>
      </div>
    </div>
  );
}
