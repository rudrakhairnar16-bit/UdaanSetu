'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { SkeletonCards } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { Button, Pagination, PageHeader, Icon } from '../../components/ui';

const PAGE_SIZE = 12;
type Tab = 'mentors' | 'schemes' | 'incubators';

function truncate(str: string, len: number) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}

/* ─── MentorCard ────────────────────────────────────────── */
function MentorCard({ r, onClick }: { r: Rec; onClick: () => void }) {
  const m = r.meta;
  const expertise: string[] = m.expertise || [];
  const shown = expertise.slice(0, 3);
  const extra = expertise.length - 3;
  const availableFor: string[] = m.available_for || [];
  const isFree = availableFor.some((a: string) => a.toLowerCase().includes('free'));

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{m.name || r.title}</div>
      {m.title && <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{m.title}</div>}
      {m.organization && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 4 }}>{m.organization}</div>}
      {m.city && <div style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 8 }}>{m.city}</div>}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
        {shown.map((e: string) => (
          <span key={e} className="badge badge-gray" style={{ fontSize: 11 }}>{e}</span>
        ))}
        {extra > 0 && <span className="badge badge-gray" style={{ fontSize: 11 }}>+{extra} more</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
        {m.years_experience != null && <span>{m.years_experience} yrs</span>}
        {m.startup_count != null && <span>{m.startup_count} startups</span>}
        {m.rating != null && <span>★ {Number(m.rating).toFixed(1)}</span>}
      </div>
      {isFree
        ? <span className="badge badge-green">Free Mentoring</span>
        : <span className="badge badge-blue">Paid</span>}
    </div>
  );
}

/* ─── SchemeCard ────────────────────────────────────────── */
function SchemeCard({ r, onClick }: { r: Rec; onClick: () => void }) {
  const m = r.meta;
  const isState = m.type?.toLowerCase().includes('state');

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{m.name || r.title}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {m.type && <span className={`badge ${isState ? 'badge-green' : 'badge-blue'}`}>{m.type}</span>}
        {m.category && <span className="badge badge-gray">{m.category}</span>}
      </div>
      {m.description && <p style={{ fontSize: 12, color: 'var(--gray-500)', lineHeight: 1.5, marginBottom: 8 }}>{truncate(m.description, 120)}</p>}
      {m.benefits && (
        <div style={{ background: 'var(--green-50, #e6f9e6)', borderLeft: '3px solid var(--green-400, #22c55e)', padding: '6px 10px', borderRadius: 4, fontSize: 12, color: 'var(--green-800, #166534)', marginBottom: 8 }}>
          {truncate(String(m.benefits), 100)}
        </div>
      )}
      {m.ministry && <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{m.ministry}</div>}
    </div>
  );
}

/* ─── IncubatorCard ─────────────────────────────────────── */
function IncubatorCard({ r, onClick }: { r: Rec; onClick: () => void }) {
  const m = r.meta;
  const focus: string[] = m.focus_areas || [];
  const programs: string[] = m.programs || [];
  const typeColor: Record<string, string> = {
    Government: 'badge-green', Private: 'badge-blue', University: 'badge-yellow', PPP: 'badge-purple',
  };

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={onClick}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{m.name || r.title}</div>
      {m.type && <span className={`badge ${typeColor[m.type] || 'badge-gray'}`}>{m.type}</span>}
      <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 6, marginBottom: 8 }}>
        {m.city && <span>{m.city}</span>}
        {m.city && m.university_or_parent && <span> · </span>}
        {m.university_or_parent && <span>{m.university_or_parent}</span>}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
        {focus.slice(0, 4).map((f: string) => (
          <span key={f} className="badge badge-gray" style={{ fontSize: 11 }}>{f}</span>
        ))}
        {focus.length > 4 && <span className="badge badge-gray" style={{ fontSize: 11 }}>+{focus.length - 4}</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
        {m.startups_supported != null && <span>{m.startups_supported} startups</span>}
        {m.founded_year && <span>Est. {m.founded_year}</span>}
        {m.capacity && <span>{m.capacity}</span>}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {programs.slice(0, 3).map((p: string) => (
          <span key={p} className="badge badge-blue" style={{ fontSize: 11 }}>{p}</span>
        ))}
        {programs.length > 3 && <span className="badge badge-blue" style={{ fontSize: 11 }}>+{programs.length - 3}</span>}
      </div>
    </div>
  );
}

/* ─── MentorDetail ──────────────────────────────────────── */
function MentorDetail({ r, onClose }: { r: Rec; onClose: () => void }) {
  const m = r.meta;
  const expertise: string[] = m.expertise || [];
  const availableFor: string[] = m.available_for || [];
  return (
    <Modal title={m.name || r.title} onClose={onClose} maxWidth={560}>
      <div style={{ marginBottom: 12 }}>
        {m.title && <div style={{ fontSize: 14, color: 'var(--gray-600)' }}>{m.title}</div>}
        {m.organization && <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{m.organization}</div>}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {expertise.map((e: string) => (
          <span key={e} className="badge badge-gray">{e}</span>
        ))}
      </div>
      {m.bio && <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 16 }}>{m.bio}</p>}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        {m.years_experience != null && (
          <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{m.years_experience}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Experience (yrs)</div>
          </div>
        )}
        {m.startup_count != null && (
          <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{m.startup_count}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Startups mentored</div>
          </div>
        )}
        {m.rating != null && (
          <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 8, padding: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 20, fontWeight: 700 }}>★ {Number(m.rating).toFixed(1)}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Rating</div>
          </div>
        )}
      </div>
      {availableFor.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Available For</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {availableFor.map((a: string) => (
              <span key={a} className="badge badge-green">{a}</span>
            ))}
          </div>
        </div>
      )}
      {m.linkedin_url && (
        <a href={m.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'var(--blue-600, #2563eb)', textDecoration: 'underline' }}>
          View LinkedIn Profile
        </a>
      )}
    </Modal>
  );
}

/* ─── SchemeDetail ──────────────────────────────────────── */
function SchemeDetail({ r, onClose }: { r: Rec; onClose: () => void }) {
  const m = r.meta;
  const isState = m.type?.toLowerCase().includes('state');
  return (
    <Modal title={m.name || r.title} onClose={onClose} maxWidth={560}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {m.type && <span className={`badge ${isState ? 'badge-green' : 'badge-blue'}`}>{m.type}</span>}
        {m.category && <span className="badge badge-gray">{m.category}</span>}
        {m.state && <span className="badge badge-gray">{m.state}</span>}
      </div>
      {m.description && <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 14 }}>{m.description}</p>}
      {m.benefits && (
        <div style={{ background: 'var(--green-50, #e6f9e6)', borderLeft: '3px solid var(--green-400, #22c55e)', padding: 12, borderRadius: 6, marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--green-800, #166534)' }}>Benefits</div>
          <div style={{ fontSize: 13, color: 'var(--green-700, #15803d)', lineHeight: 1.5 }}>{m.benefits}</div>
        </div>
      )}
      {m.eligibility && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Eligibility</div>
          <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>{m.eligibility}</div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--gray-500)' }}>
        {m.ministry && <div>Ministry: {m.ministry}</div>}
        {m.budget && <div>Budget: {m.budget}</div>}
        {m.website && (
          <a href={m.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-600, #2563eb)', textDecoration: 'underline' }}>
            Visit Website
          </a>
        )}
      </div>
    </Modal>
  );
}

/* ─── IncubatorDetail ───────────────────────────────────── */
function IncubatorDetail({ r, onClose }: { r: Rec; onClose: () => void }) {
  const m = r.meta;
  const focus: string[] = m.focus_areas || [];
  const programs: string[] = m.programs || [];
  const notable: string[] = m.notable_startups || [];
  const typeColor: Record<string, string> = {
    Government: 'badge-green', Private: 'badge-blue', University: 'badge-yellow', PPP: 'badge-purple',
  };
  return (
    <Modal title={m.name || r.title} onClose={onClose} maxWidth={560}>
      {m.type && <span className={`badge ${typeColor[m.type] || 'badge-gray'}`} style={{ marginBottom: 10 }}>{m.type}</span>}
      <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12 }}>
        {m.city && <span>{m.city}</span>}
        {m.district && <span> · {m.district}</span>}
        {m.university_or_parent && <span> · {m.university_or_parent}</span>}
      </div>
      {focus.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Focus Areas</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {focus.map((f: string) => <span key={f} className="badge badge-gray">{f}</span>)}
          </div>
        </div>
      )}
      {programs.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Programs</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {programs.map((p: string) => <span key={p} className="badge badge-blue">{p}</span>)}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        {m.startups_supported != null && (
          <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{m.startups_supported}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Startups supported</div>
          </div>
        )}
        {m.founded_year && (
          <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{m.founded_year}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Founded</div>
          </div>
        )}
        {m.capacity && (
          <div style={{ flex: 1, background: 'var(--gray-100)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{m.capacity}</div>
            <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Capacity</div>
          </div>
        )}
      </div>
      {notable.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Notable Startups</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--gray-600)' }}>
            {notable.map((n: string) => <li key={n} style={{ marginBottom: 2 }}>{n}</li>)}
          </ul>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
        {m.website && (
          <a href={m.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue-600, #2563eb)', textDecoration: 'underline' }}>
            Visit Website
          </a>
        )}
        {m.contact_email && <span style={{ color: 'var(--gray-500)' }}>{m.contact_email}</span>}
      </div>
    </Modal>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ─── Main Page ──────────────────────────────────────────── */
/* ═══════════════════════════════════════════════════════════ */
export default function EcosystemPage() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'mentors';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [mentors, setMentors] = useState<Rec[]>([]);
  const [schemes, setSchemes] = useState<Rec[]>([]);
  const [incubators, setIncubators] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Rec | null>(null);
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = async () => {
    setLoading(true);
    const [m, s, i] = await Promise.allSettled([
      api.get<Rec[]>('/records?kind=mentor'),
      api.get<Rec[]>('/records?kind=scheme'),
      api.get<Rec[]>('/records?kind=incubator'),
    ]);
    if (m.status === 'fulfilled') setMentors(m.value);
    if (s.status === 'fulfilled') setSchemes(s.value);
    if (i.status === 'fulfilled') setIncubators(i.value);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { setPage(1); }, [tab, search]);

  const allByTab = tab === 'mentors' ? mentors : tab === 'schemes' ? schemes : incubators;

  const items = allByTab.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    const m = r.meta as Record<string, any>;
    const searchable = [
      r.title, r.description, r.sector,
      m.name, m.title, m.organization, m.city, m.bio,
      m.category, m.ministry, m.state, m.type,
      m.district, m.university_or_parent,
      ...(m.expertise || []),
      ...(m.focus_areas || []),
      ...(m.programs || []),
    ].filter(Boolean).join(' ').toLowerCase();
    return searchable.includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

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

  const exportData = async (format: 'csv' | 'json') => {
    const kindMap: Record<Tab, string> = { mentors: 'mentor', schemes: 'scheme', incubators: 'incubator' };
    const kind = kindMap[tab];
    try {
      const token = api.getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/records/export?kind=${kind}&format=${format}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${kind}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

  const counts = { mentors: mentors.length, schemes: schemes.length, incubators: incubators.length };

  const tabs: [Tab, string][] = [['mentors', 'Mentors'], ['schemes', 'Schemes'], ['incubators', 'Incubators']];

  return (
    <div>
      <PageHeader
        crumb="Ecosystem"
        title="Ecosystem Support"
        subtitle="Mentors · Schemes · Incubators"
        action={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => exportData('csv')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="download" size={14} /> CSV
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => exportData('json')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="download" size={14} /> JSON
            </button>
          </div>
        }
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--gray-100)', padding: 4, borderRadius: 10 }}>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setDetail(null); }}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: tab === key ? 'var(--surface)' : 'transparent',
              color: tab === key ? 'var(--green-800)' : 'var(--gray-500)',
              boxShadow: tab === key ? 'var(--shadow-sm)' : 'none',
              transition: 'all .15s',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {label}
            <span style={{
              fontSize: 11, fontWeight: 700, borderRadius: 10,
              padding: '1px 7px',
              background: tab === key ? 'var(--green-100, #dcfce7)' : 'var(--gray-200)',
              color: tab === key ? 'var(--green-700, #15803d)' : 'var(--gray-500)',
            }}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: 400, marginBottom: 16 }}>
        <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex', pointerEvents: 'none' }}>
          <Icon name="search" size={16} />
        </span>
        <input
          aria-label={`Search ${tab}`}
          placeholder={`Search ${tab}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: 38 }}
        />
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonCards count={4} />
      ) : items.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 40, marginBottom: 8 }}>🤝</div>
          <p style={{ fontWeight: 700, color: 'var(--gray-600)' }}>No {tab} found</p>
          <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Try adjusting your search.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {paged.map(r => {
              if (tab === 'mentors') return <MentorCard key={r.id} r={r} onClick={() => setDetail(r)} />;
              if (tab === 'schemes') return <SchemeCard key={r.id} r={r} onClick={() => setDetail(r)} />;
              return <IncubatorCard key={r.id} r={r} onClick={() => setDetail(r)} />;
            })}
          </div>
          {items.length > PAGE_SIZE && (
            <Pagination current={safePage} total={totalPages} onChange={setPage} />
          )}
        </div>
      )}

      {/* Detail modals */}
      {detail && tab === 'mentors' && (
        <MentorDetail r={detail} onClose={() => setDetail(null)} />
      )}
      {detail && tab === 'schemes' && (
        <SchemeDetail r={detail} onClose={() => setDetail(null)} />
      )}
      {detail && tab === 'incubators' && (
        <IncubatorDetail r={detail} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}
