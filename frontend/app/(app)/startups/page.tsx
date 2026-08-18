'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';
import { StageBadge } from '../../components/StageBadge';
import { Modal } from '../../components/Modal';
import { SkeletonCards } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

export default function StartupsPage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [innovations, setInnovations] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState<Rec | null>(null);
  const [detail, setDetail] = useState<Rec | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = async () => {
    setLoading(true);
    const [st, inn] = await Promise.all([
      api.get<Rec[]>('/records?kind=startup'),
      api.get<Rec[]>('/records?kind=innovation'),
    ]);
    setRecords(st);
    setInnovations(inn);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadMatch = async (st: Rec) => {
    setDetail(st);
    setMatch(null);
    try { setMatch(await api.get<any>(`/ai/match/${st.id}`)); } catch {}
  };

  const handleDelete = async (r: Rec) => {
    const ok = await confirm(`Delete "${r.title}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await api.delete(`/records/${r.id}`);
      toast('Startup deleted');
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
        meta: {
          ...editRecord.meta,
          jobs_created: Number(f.get('jobs_created')) || 0,
          farmers_reached: Number(f.get('farmers_reached')) || 0,
          revenue: Number(f.get('revenue')) || 0,
          impact_description: f.get('impact_description') || '',
        },
      });
      toast('Startup updated');
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

  const totalJobs = records.reduce((a, r) => a + (r.meta.jobs_created || 0), 0);
  const totalFarmers = records.reduce((a, r) => a + (r.meta.farmers_reached || 0), 0);
  const totalRevenue = records.reduce((a, r) => a + (r.meta.revenue || 0), 0);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Startups</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{records.length} startups · Track impact and growth</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Startup</button>
      </div>

      <input placeholder="Search startups..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', maxWidth: 400, marginBottom: 16 }} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><span className="label">Total Startups</span><span className="value">{records.length}</span></div>
        <div className="stat-card"><span className="label">Jobs Created</span><span className="value">{totalJobs}</span></div>
        <div className="stat-card"><span className="label">Users Reached</span><span className="value">{totalFarmers.toLocaleString()}</span></div>
        <div className="stat-card"><span className="label">Total Revenue</span><span className="value">₹{(totalRevenue / 100000).toFixed(1)}L</span></div>
      </div>

      {loading ? <SkeletonCards count={4} /> : filtered.length === 0 ? (
        <div className="empty"><div style={{ fontSize: 40 }}>🚀</div><p>No startups found</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {filtered.map(r => (
            <div key={r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => loadMatch(r)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{r.title}</div>
                {r.is_demo && <span className="badge badge-yellow">DEMO</span>}
              </div>
              <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10, lineHeight: 1.5 }}>{r.description.slice(0, 120)}...</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                <StageBadge stage={r.stage} />
                {r.sector && <span className="badge badge-gray">{r.sector}</span>}
                {r.district && <span className="badge badge-gray">{r.district}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center', padding: 8, background: '#f9fafb', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{r.meta.jobs_created || 0}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Jobs</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, background: '#f9fafb', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>{r.meta.farmers_reached || 0}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Users</div>
                </div>
                <div style={{ textAlign: 'center', padding: 8, background: '#f9fafb', borderRadius: 6 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#166534' }}>₹{((r.meta.revenue || 0) / 1000).toFixed(0)}K</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>Revenue</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detail && !editRecord && (
        <Modal title={detail.title} onClose={() => setDetail(null)} maxWidth={640}>
          <p style={{ margin: '0 0 12px', fontSize: 14, color: '#4b5563' }}>{detail.description}</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <StageBadge stage={detail.stage} />
            {detail.sector && <span className="badge badge-gray">{detail.sector}</span>}
            {detail.district && <span className="badge badge-gray">{detail.district}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditRecord(detail)}>Edit</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(detail)}>Delete</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Jobs Created', value: detail.meta.jobs_created || 0 },
              { label: 'Users Reached', value: detail.meta.farmers_reached || 0 },
              { label: 'Revenue', value: `₹${((detail.meta.revenue || 0) / 100000).toFixed(1)}L` },
              { label: 'Impact', value: detail.meta.impact_description || '—' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: i === 3 ? 13 : 18, fontWeight: i === 3 ? 400 : 800, color: '#374151', marginTop: 4 }}>{item.value}</div>
              </div>
            ))}
          </div>
          {match && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Smart Match Results</h3>
              {['mentors', 'schemes', 'incubators'].map(type => match[type]?.length > 0 && (
                <div key={type} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 6, textTransform: 'capitalize' }}>{type}</div>
                  {match[type].map((m: any) => (
                    <div key={m.id} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <div><span style={{ fontWeight: 600 }}>{m.title}</span><div style={{ fontSize: 12, color: '#6b7280' }}>{m.match_reason}</div></div>
                      <span style={{ fontWeight: 700, color: '#16a34a' }}>{m.score}%</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* Edit modal */}
      {editRecord && (
        <Modal title="Edit Startup" onClose={() => setEditRecord(null)} maxWidth={600}>
          <form onSubmit={handleEditSave}>
            <div className="form-group"><label>Title *</label><input name="title" defaultValue={editRecord.title} required /></div>
            <div className="form-group"><label>Description</label><textarea name="description" defaultValue={editRecord.description} rows={3} /></div>
            <div className="form-row">
              <div className="form-group"><label>Stage</label>
                <select name="stage" defaultValue={editRecord.stage}>{['Idea', 'Pre-seed', 'Seed', 'Series A', 'Growth'].map(s => <option key={s}>{s}</option>)}</select>
              </div>
              <div className="form-group"><label>Sector</label><input name="sector" defaultValue={editRecord.sector} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>District</label><input name="district" defaultValue={editRecord.district} /></div>
              <div className="form-group"><label>Linked Innovation</label>
                <select name="innovation_id" defaultValue={editRecord.parent_id || ''}>
                  <option value="">None</option>
                  {innovations.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Jobs Created</label><input name="jobs_created" type="number" defaultValue={editRecord.meta.jobs_created || 0} /></div>
              <div className="form-group"><label>Users Reached</label><input name="farmers_reached" type="number" defaultValue={editRecord.meta.farmers_reached || 0} /></div>
            </div>
            <div className="form-group"><label>Revenue (₹)</label><input name="revenue" type="number" defaultValue={editRecord.meta.revenue || 0} /></div>
            <div className="form-group"><label>Impact Description</label><input name="impact_description" defaultValue={editRecord.meta.impact_description || ''} /></div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setEditRecord(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Create modal */}
      {showCreate && (
        <Modal title="New Startup" onClose={() => setShowCreate(false)}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            try {
              await api.post('/records/startup', {
                title: f.get('title'), description: f.get('description'),
                stage: f.get('stage'), sector: f.get('sector'), district: f.get('district'),
                parent_id: f.get('innovation_id') ? Number(f.get('innovation_id')) : null,
                meta: {
                  jobs_created: Number(f.get('jobs_created')) || 0,
                  farmers_reached: Number(f.get('farmers_reached')) || 0,
                  revenue: Number(f.get('revenue')) || 0,
                  impact_description: f.get('impact_description') || '',
                },
              });
              toast('Startup created');
              setShowCreate(false);
              load();
            } catch (err: any) { toast(err.message, 'error'); }
          }}>
            <div className="form-group"><label>Title *</label><input name="title" required /></div>
            <div className="form-group"><label>Description</label><textarea name="description" /></div>
            <div className="form-row">
              <div className="form-group"><label>Stage</label><select name="stage">{['Idea', 'Pre-seed', 'Seed', 'Series A', 'Growth'].map(s => <option key={s}>{s}</option>)}</select></div>
              <div className="form-group"><label>Linked Innovation</label><select name="innovation_id"><option value="">None</option>{innovations.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}</select></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Sector</label><input name="sector" /></div>
              <div className="form-group"><label>District</label><input name="district" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Jobs Created</label><input name="jobs_created" type="number" defaultValue={0} /></div>
              <div className="form-group"><label>Users Reached</label><input name="farmers_reached" type="number" defaultValue={0} /></div>
            </div>
            <div className="form-group"><label>Revenue (₹)</label><input name="revenue" type="number" defaultValue={0} /></div>
            <div className="form-group"><label>Impact Description</label><input name="impact_description" /></div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Create Startup</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
