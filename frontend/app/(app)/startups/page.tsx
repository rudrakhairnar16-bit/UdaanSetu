'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { api } from '../../lib/api';
import type { AppRecord as Rec } from '../../lib/types';
import { StageBadge } from '../../components/StageBadge';
import { Modal } from '../../components/Modal';
import { SkeletonCards } from '../../components/LoadingSpinner';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { Button, Pagination, PageHeader, Icon } from '../../components/ui';

const PAGE_SIZE = 12;

interface SearchResponse {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  items: Rec[];
}

interface FilterOptions {
  districts: string[];
  sectors: string[];
  stages: string[];
  kinds: string[];
}

export default function StartupsPage() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [innovations, setInnovations] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editRecord, setEditRecord] = useState<Rec | null>(null);
  const [detail, setDetail] = useState<Rec | null>(null);
  const [match, setMatch] = useState<any>(null);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({ districts: [], sectors: [], stages: [], kinds: [] });
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterKind, setFilterKind] = useState('');
  const [filterHasWebsite, setFilterHasWebsite] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchRef = useRef(search);

  const loadFilters = async () => {
    try {
      const data = await api.get<FilterOptions>('/records/filters');
      setFilters(data);
    } catch {}
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      params.set('kind', 'startup');
      params.set('page', String(page));
      params.set('per_page', String(PAGE_SIZE));
      if (search.trim()) params.set('q', search.trim());
      if (filterDistrict) params.set('district', filterDistrict);
      if (filterSector) params.set('sector', filterSector);
      if (filterStage) params.set('stage', filterStage);
      if (filterKind) params.set('kind', filterKind);
      if (filterHasWebsite !== null) params.set('has_website', String(filterHasWebsite));
      if (sortBy) params.set('sort_by', sortBy);

      const [searchData, inn] = await Promise.all([
        api.get<SearchResponse>(`/records/search?${params.toString()}`),
        api.get<Rec[]>('/records?kind=innovation'),
      ]);
      setRecords(searchData.items);
      setTotalPages(searchData.total_pages);
      setTotalResults(searchData.total);
      setInnovations(inn);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
      toast('Failed to load startups', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterDistrict, filterSector, filterStage, filterKind, filterHasWebsite, sortBy]);

  useEffect(() => { loadFilters(); }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchRef.current !== search) {
        searchRef.current = search;
        setPage(1);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const handleFilterChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setFilterDistrict('');
    setFilterSector('');
    setFilterStage('');
    setFilterKind('');
    setFilterHasWebsite(null);
    setSortBy('relevance');
    setSearch('');
    setPage(1);
  };

  const hasActiveFilters = filterDistrict || filterSector || filterStage || filterKind || filterHasWebsite !== null || sortBy !== 'relevance';

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams();
      params.set('kind', 'startup');
      params.set('format', format);
      if (search.trim()) params.set('q', search.trim());
      if (filterDistrict) params.set('district', filterDistrict);
      if (filterSector) params.set('sector', filterSector);
      if (filterStage) params.set('stage', filterStage);

      const token = api.getToken();
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/records/export?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `startups.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast(`Exported as ${format.toUpperCase()}`);
    } catch (err: any) {
      toast(err.message, 'error');
    }
  };

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

  const totalJobs = records.reduce((a, r) => a + (r.meta.jobs_created || 0), 0);
  const totalFarmers = records.reduce((a, r) => a + (r.meta.farmers_reached || 0), 0);
  const totalRevenue = records.reduce((a, r) => a + (r.meta.revenue || 0), 0);

  return (
    <div>
      <PageHeader
        crumb="Startups"
        title="Startups"
        subtitle={`${totalResults} startups · Gujarat DPIIT Registry`}
        action={<Button onClick={() => setShowCreate(true)} icon={<Icon name="plus" size={16} />}>New Startup</Button>}
      />

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 480 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', display: 'flex', pointerEvents: 'none' }}>
            <Icon name="search" size={16} />
          </span>
          <input
            aria-label="Search startups"
            placeholder="Search by name, CIN, services, description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <button
          className={`btn btn-sm ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Icon name="filter" size={14} /> Filters
          {hasActiveFilters && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-600)', display: 'inline-block' }} />}
        </button>
        {hasActiveFilters && (
          <button className="btn btn-sm btn-ghost" onClick={clearFilters} style={{ color: 'var(--red-500)' }}>
            Clear
          </button>
        )}
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 10,
          padding: 16, background: 'var(--surface-soft)', borderRadius: 10, marginBottom: 16,
          border: '1px solid var(--border-soft)',
        }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>District</label>
            <select value={filterDistrict} onChange={handleFilterChange(setFilterDistrict)}>
              <option value="">All Districts</option>
              {filters.districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Sector</label>
            <select value={filterSector} onChange={handleFilterChange(setFilterSector)}>
              <option value="">All Sectors</option>
              {filters.sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Stage</label>
            <select value={filterStage} onChange={handleFilterChange(setFilterStage)}>
              <option value="">All Stages</option>
              {filters.stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Has Website</label>
            <select
              value={filterHasWebsite === null ? '' : String(filterHasWebsite)}
              onChange={e => {
                const v = e.target.value;
                setFilterHasWebsite(v === '' ? null : v === 'true');
                setPage(1);
              }}
            >
              <option value="">Any</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-500)', textTransform: 'uppercase', marginBottom: 4 }}>Sort By</label>
            <select value={sortBy} onChange={handleFilterChange(setSortBy)}>
              <option value="relevance">Relevance</option>
              <option value="name">Name (A-Z)</option>
              <option value="date">Date (Newest)</option>
              <option value="district">District</option>
            </select>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        <div className="stat-card"><span className="label">Total Startups</span><span className="value">{totalResults}</span></div>
        <div className="stat-card"><span className="label">Jobs Created</span><span className="value">{totalJobs}</span></div>
        <div className="stat-card"><span className="label">Users Reached</span><span className="value">{totalFarmers.toLocaleString()}</span></div>
        <div className="stat-card"><span className="label">Total Revenue</span><span className="value">₹{(totalRevenue / 100000).toFixed(1)}L</span></div>
      </div>

      {loading ? <SkeletonCards count={4} /> : error ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--red-500)', marginBottom: 12 }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={load}>Retry</button>
        </div>
      ) : records.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 40, marginBottom: 8 }}>🚀</div>
          <p style={{ fontWeight: 700, color: 'var(--gray-600)' }}>No startups found</p>
          <p style={{ fontSize: 13, color: 'var(--gray-400)' }}>Try adjusting your search or filters, or create a new startup.</p>
        </div>
      ) : (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
            {records.map(r => (
              <div key={r.id} className="card" style={{ cursor: 'pointer', position: 'relative' }} onClick={() => loadMatch(r)}>
                {r.is_demo && <span className="badge badge-yellow" style={{ position: 'absolute', top: 10, right: 10 }}>DEMO</span>}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2, paddingRight: r.is_demo ? 50 : 0 }}>{r.title}</div>
                  {r.meta.cin && <div style={{ fontSize: 11, color: 'var(--gray-400)', fontFamily: 'monospace' }}>CIN: {r.meta.cin}</div>}
                </div>
                <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 10, lineHeight: 1.5 }}>
                  {(r.description || '').slice(0, 120)}{r.description?.length > 120 ? '...' : ''}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                  <StageBadge stage={r.stage} />
                  {r.district && <span className="badge badge-gray">{r.district}</span>}
                  {r.sector && <span className="badge badge-blue">{r.sector}</span>}
                </div>
                {r.meta.website && (
                  <a
                    href={r.meta.website.startsWith('http') ? r.meta.website : `https://${r.meta.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: 12, color: 'var(--green-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}
                  >
                    <Icon name="external-link" size={12} /> {r.meta.website.replace(/^https?:\/\//, '').slice(0, 40)}
                  </a>
                )}
                {r.meta.services && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                    {(Array.isArray(r.meta.services) ? r.meta.services : [r.meta.services]).slice(0, 3).map((svc: string, i: number) => (
                      <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 9999, background: 'var(--blue-50)', color: 'var(--blue-700)', border: '1px solid var(--blue-100)' }}>
                        {svc}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div style={{ textAlign: 'center', padding: 8, background: 'var(--surface-soft)', borderRadius: 6 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-800)' }}>{r.meta.jobs_created || 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Jobs</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 8, background: 'var(--surface-soft)', borderRadius: 6 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-800)' }}>{r.meta.farmers_reached || 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Users</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: 8, background: 'var(--surface-soft)', borderRadius: 6 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--green-800)' }}>₹{((r.meta.revenue || 0) / 1000).toFixed(0)}K</div>
                    <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>Revenue</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ marginTop: 20 }}>
              <Pagination current={page} total={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {detail && !editRecord && (
        <Modal title={detail.title} onClose={() => setDetail(null)} maxWidth={640}>
          {detail.meta.cin && (
            <div style={{ fontSize: 12, color: 'var(--gray-400)', fontFamily: 'monospace', marginBottom: 8 }}>
              CIN: {detail.meta.cin}
            </div>
          )}
          <p style={{ margin: '0 0 12px', fontSize: 14, color: 'var(--gray-600)' }}>{detail.description}</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <StageBadge stage={detail.stage} />
            {detail.district && <span className="badge badge-gray">{detail.district}</span>}
            {detail.sector && <span className="badge badge-blue">{detail.sector}</span>}
          </div>
          {detail.meta.website && (
            <a
              href={detail.meta.website.startsWith('http') ? detail.meta.website : `https://${detail.meta.website}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: 'var(--green-600)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16 }}
            >
              <Icon name="external-link" size={14} /> {detail.meta.website}
            </a>
          )}
          {detail.meta.services && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'uppercase' }}>Services</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(Array.isArray(detail.meta.services) ? detail.meta.services : [detail.meta.services]).map((svc: string, i: number) => (
                  <span key={i} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 9999, background: 'var(--blue-50)', color: 'var(--blue-700)', border: '1px solid var(--blue-100)' }}>
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}
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
              <div key={i} style={{ background: 'var(--surface-soft)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 600 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontSize: i === 3 ? 13 : 18, fontWeight: i === 3 ? 400 : 800, color: 'var(--gray-700)', marginTop: 4 }}>{item.value}</div>
              </div>
            ))}
          </div>
          {match && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Smart Match Results</h3>
              {['mentors', 'schemes', 'incubators'].map(type => match[type]?.length > 0 && (
                <div key={type} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 6, textTransform: 'capitalize' }}>{type}</div>
                  {match[type].map((m: any) => (
                    <div key={m.id} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-soft)', marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <div><span style={{ fontWeight: 600 }}>{m.title}</span><div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{m.match_reason}</div></div>
                      <span style={{ fontWeight: 700, color: 'var(--green-600)' }}>{m.score}%</span>
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
                <select name="stage" defaultValue={editRecord.stage}>
                  {['Active', 'Scaling', 'Early Traction', 'Prototype', 'Validation', 'Idea', 'Pre-seed', 'Seed', 'Series A', 'Growth'].map(s => <option key={s}>{s}</option>)}
                </select>
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
              <div className="form-group"><label>Stage</label>
                <select name="stage">
                  {['Active', 'Scaling', 'Early Traction', 'Prototype', 'Validation', 'Idea', 'Pre-seed', 'Seed', 'Series A', 'Growth'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Linked Innovation</label>
                <select name="innovation_id"><option value="">None</option>{innovations.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}</select>
              </div>
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
