'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';
import { StageBadge } from '../../components/StageBadge';
import { Modal } from '../../components/Modal';
import { SkeletonCards } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

type Tab = 'mentors' | 'schemes' | 'incubators' | 'funding_requests';

function CreateModal({ kind, onClose, onCreated }: { kind: string; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', stage: 'Available', sector: '', district: '' });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const meta: Record<string, any> = {};
    const f = new FormData(e.currentTarget as HTMLFormElement);
    if (kind === 'scheme') {
      meta.amount = Number(f.get('amount')) || 0;
      meta.eligibility = String(f.get('eligibility') || '');
      meta.deadline = String(f.get('deadline') || '');
      meta.type = String(f.get('scheme_type') || 'Grant');
    }
    if (kind === 'incubator') {
      meta.capacity = Number(f.get('capacity')) || 0;
      meta.services = String(f.get('services') || '').split(',').map((s: string) => s.trim());
    }
    if (kind === 'mentor') {
      meta.expertise = String(f.get('expertise') || '').split(',').map((s: string) => s.trim());
      meta.bio = String(f.get('bio') || '');
    }
    try {
      await api.post(`/records/${kind}`, { ...form, meta });
      toast(`${kind.charAt(0).toUpperCase() + kind.slice(1)} created`);
      onCreated();
    } catch (err: any) { toast(err.message, 'error'); }
    setSaving(false);
  };

  return (
    <Modal title={`New ${kind.charAt(0).toUpperCase() + kind.slice(1)}`} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="form-group"><label>Title *</label><input name="title" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-row">
          <div className="form-group"><label>Sector</label><input name="sector" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} /></div>
          <div className="form-group"><label>District</label><input name="district" value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
        </div>
        {kind === 'scheme' && <>
          <div className="form-row">
            <div className="form-group"><label>Amount (₹)</label><input name="amount" type="number" /></div>
            <div className="form-group"><label>Type</label><input name="scheme_type" placeholder="Grant, Accelerator..." /></div>
          </div>
          <div className="form-group"><label>Eligibility</label><input name="eligibility" /></div>
          <div className="form-group"><label>Deadline</label><input name="deadline" type="date" /></div>
        </>}
        {kind === 'incubator' && <>
          <div className="form-group"><label>Capacity</label><input name="capacity" type="number" /></div>
          <div className="form-group"><label>Services (comma-separated)</label><input name="services" placeholder="lab access, mentorship..." /></div>
        </>}
        {kind === 'mentor' && <>
          <div className="form-group"><label>Expertise (comma-separated)</label><input name="expertise" placeholder="IPR, product dev..." /></div>
          <div className="form-group"><label>Bio</label><input name="bio" /></div>
        </>}
        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function EcosystemPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'mentors';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [detail, setDetail] = useState<Rec | null>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = async () => {
    setLoading(true);
    const [m, s, i, fr] = await Promise.all([
      api.get<Rec[]>('/records?kind=mentor'),
      api.get<Rec[]>('/records?kind=scheme'),
      api.get<Rec[]>('/records?kind=incubator'),
      api.get<Rec[]>('/records?kind=funding_request'),
    ]);
    setRecords([...m, ...s, ...i, ...fr]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const items = records.filter(r => r.kind === tab.replace('funding_requests', 'funding_request'));
  const filtered = items.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.sector.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (r: Rec) => {
    const ok = await confirm(`Delete "${r.title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/records/${r.id}`);
      toast(`${r.kind} deleted`);
      setDetail(null);
      load();
    } catch (err: any) { toast(err.message, 'error'); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Ecosystem Support</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>Mentors · Funding Schemes · Incubators · Funding Requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New {tab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()).slice(0, -1)}</button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#f3f4f6', padding: 4, borderRadius: 10 }}>
        {([['mentors', 'Mentors'], ['schemes', 'Schemes'], ['incubators', 'Incubators'], ['funding_requests', 'Funding Requests']] as [Tab, string][]).map(([key, label]) => (
          <button key={key} onClick={() => { setTab(key); setDetail(null); }}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: tab === key ? 'white' : 'transparent', color: tab === key ? '#166534' : '#6b7280', boxShadow: tab === key ? 'var(--shadow-sm)' : 'none', transition: 'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      <input placeholder={`Search ${tab.replace('_', ' ')}...`} value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 16 }} />

      {loading ? <SkeletonCards count={4} /> : filtered.length === 0 ? (
        <div className="empty"><div style={{ fontSize: 40 }}>🤝</div><p>No {tab.replace('_', ' ')} found</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => setDetail(r)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.title}</div>
                {r.is_demo && <span className="badge badge-yellow">DEMO</span>}
              </div>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{r.description.slice(0, 120)}...</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StageBadge stage={r.stage} />
                {r.sector && <span className="badge badge-gray">{r.sector}</span>}
                {r.district && <span className="badge badge-gray">{r.district}</span>}
                {r.meta.amount && <span className="badge badge-green">₹{(r.meta.amount / 100000).toFixed(1)}L</span>}
                {r.meta.type && <span className="badge badge-blue">{r.meta.type}</span>}
              </div>
              {r.meta.expertise && <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>{r.meta.expertise.map((e: string) => <span key={e} className="badge badge-gray" style={{ fontSize: 11 }}>{e}</span>)}</div>}
              {r.meta.services && <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>{r.meta.services.map((s: string) => <span key={s} className="badge badge-blue" style={{ fontSize: 11 }}>{s}</span>)}</div>}
            </div>
          ))}
        </div>
      )}

      {detail && (
        <Modal title={detail.title} onClose={() => setDetail(null)} maxWidth={560}>
          <div style={{ display: 'flex', gap: 8, margin: '0 0 12px' }}>
            <StageBadge stage={detail.stage} />
            {detail.sector && <span className="badge badge-gray">{detail.sector}</span>}
            {detail.district && <span className="badge badge-gray">{detail.district}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(detail)}>Delete</button>
          </div>
          <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 16 }}>{detail.description}</p>
          {detail.meta.amount && <p style={{ fontSize: 16, fontWeight: 700, color: '#166534' }}>Amount: ₹{(detail.meta.amount / 100000).toFixed(1)}L</p>}
          {detail.meta.eligibility && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Eligibility: {detail.meta.eligibility}</p>}
          {detail.meta.deadline && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Deadline: {detail.meta.deadline}</p>}
          {detail.meta.bio && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>{detail.meta.bio}</p>}
        </Modal>
      )}

      {showCreate && <CreateModal kind={tab === 'funding_requests' ? 'funding_request' : tab.slice(0, -1)} onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load(); }} />}
    </div>
  );
}
