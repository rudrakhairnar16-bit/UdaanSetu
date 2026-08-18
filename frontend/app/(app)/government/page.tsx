'use client';

import { useState } from 'react';
import { api } from '../../lib/api';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import type { GovResponse } from '../../lib/types';

type Tab = 'aadhaar' | 'digilocker' | 'startup-india' | 'ip-india' | 'ondc';

function ResultCard({ data }: { data: GovResponse | null }) {
  if (!data) return null;
  const statusColors: Record<string, string> = {
    verified: '#16a34a', registered: '#16a34a', ok: '#16a34a', fetched: '#16a34a',
    otp_sent: '#3b82f6', pending: '#f59e0b', not_found: '#ef4444', failed: '#ef4444', error: '#ef4444',
  };
  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700 }}>Result</h3>
        <span className="badge" style={{ background: statusColors[data.status] || '#6b7280', color: 'white', padding: '4px 12px' }}>
          {data.status?.toUpperCase()}
        </span>
      </div>
      {data.message && <p style={{ fontSize: 14, color: '#4b5563', marginBottom: 12 }}>{data.message}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {Object.entries(data).filter(([k]) => !['service', 'timestamp', 'request_id', 'demo', 'message', 'products', 'startups', 'benefits', 'patents', 'documents'].includes(k)).map(([k, v]) => (
          <div key={k} style={{ padding: '8px 12px', background: '#f9fafb', borderRadius: 6 }}>
            <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>{k.replace(/_/g, ' ')}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginTop: 2 }}>{String(v)}</div>
          </div>
        ))}
      </div>
      {data.request_id && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 12 }}>Request ID: {data.request_id} · Demo mode</div>}
    </div>
  );
}

function AadhaarTab() {
  const [aadhaar, setAadhaar] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState<GovResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<GovResponse>('/government/aadhaar/verify', { aadhaar_number: aadhaar, name });
      setResult(res);
      toast(res.status === 'verified' ? 'Aadhaar verified' : 'Verification failed', res.status === 'verified' ? 'success' : 'error');
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  const handleSendOTP = async () => {
    if (!aadhaar) { toast('Enter Aadhaar number', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.post<GovResponse>('/government/aadhaar/send-otp', { aadhaar_number: aadhaar });
      setResult(res);
      setOtpSent(true);
      toast('OTP sent');
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<GovResponse>('/government/aadhaar/verify-otp', { aadhaar_number: aadhaar, otp });
      setResult(res);
      toast(res.status === 'verified' ? 'OTP verified' : 'OTP failed', res.status === 'verified' ? 'success' : 'error');
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Aadhaar eKYC</h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Verify identity using Aadhaar number. Supports direct verification and OTP-based flow.</p>

      <form onSubmit={handleVerify} style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
        <div className="form-group"><label>Aadhaar Number (12 digits)</label>
          <input value={aadhaar} onChange={e => setAadhaar(e.target.value)} placeholder="1234 5678 9012" maxLength={14} required />
        </div>
        <div className="form-group"><label>Name (optional)</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Name as on Aadhaar" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify Aadhaar'}</button>
          <button type="button" className="btn btn-secondary" onClick={handleSendOTP} disabled={loading}>Send OTP</button>
        </div>
      </form>

      {otpSent && (
        <form onSubmit={handleVerifyOTP} style={{ display: 'flex', gap: 8, marginTop: 12, maxWidth: 400, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}><label>Enter OTP (use 123456)</label>
            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" maxLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>Verify OTP</button>
        </form>
      )}

      <ResultCard data={result} />
    </div>
  );
}

function DigiLockerTab() {
  const [docType, setDocType] = useState('aadhaar');
  const [docId, setDocId] = useState('');
  const [result, setResult] = useState<GovResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const DOC_TYPES = [
    { value: 'aadhaar', label: 'Aadhaar Card' },
    { value: 'pan', label: 'PAN Card' },
    { value: 'driving_license', label: 'Driving License' },
    { value: 'voter_id', label: 'Voter ID' },
    { value: 'education_10th', label: '10th Marksheet' },
    { value: 'education_12th', label: '12th Marksheet' },
    { value: 'degree', label: 'Degree Certificate' },
    { value: 'registration_certificate', label: 'Startup Registration' },
  ];

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<GovResponse>('/government/digilocker/verify', { document_type: docType, document_id: docId });
      setResult(res);
      toast(res.status === 'verified' ? 'Document verified' : 'Verification failed', res.status === 'verified' ? 'success' : 'error');
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>DigiLocker Documents</h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Verify documents through DigiLocker. Supports Aadhaar, PAN, DL, education certificates, and more.</p>

      <form onSubmit={handleVerify} style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
        <div className="form-group"><label>Document Type</label>
          <select value={docType} onChange={e => setDocType(e.target.value)}>
            {DOC_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <div className="form-group"><label>Document ID (optional)</label>
          <input value={docId} onChange={e => setDocId(e.target.value)} placeholder="Document number" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify Document'}</button>
      </form>

      <ResultCard data={result} />
    </div>
  );
}

function StartupIndiaTab() {
  const [regNum, setRegNum] = useState('');
  const [startupName, setStartupName] = useState('');
  const [benefits, setBenefits] = useState<any>(null);
  const [result, setResult] = useState<GovResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<GovResponse>('/government/startup-india/verify', { registration_number: regNum, startup_name: startupName });
      setResult(res);
      setBenefits(null);
      toast(res.status === 'verified' ? 'Startup found' : 'Not found', res.status === 'verified' ? 'success' : 'error');
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  const handleBenefits = async () => {
    if (!regNum) { toast('Enter registration number', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.get<any>(`/government/startup-india/benefits/${regNum}`);
      setBenefits(res);
      toast('Benefits loaded');
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Startup India Registry</h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Verify DPIIT recognition, check benefits (tax exemption, patent rebates), and register new startups.</p>

      <form onSubmit={handleVerify} style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
        <div className="form-group"><label>Registration Number</label>
          <input value={regNum} onChange={e => setRegNum(e.target.value)} placeholder="SUP123456" required />
        </div>
        <div className="form-group"><label>Startup Name (optional)</label>
          <input value={startupName} onChange={e => setStartupName(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Verifying...' : 'Verify Registration'}</button>
          <button type="button" className="btn btn-secondary" onClick={handleBenefits} disabled={loading}>Check Benefits</button>
        </div>
      </form>

      <ResultCard data={result} />

      {benefits && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Available Benefits</h3>
          {benefits.benefits?.map((b: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f3f4f6' }}>
              <span style={{ fontSize: 14 }}>{b.name}</span>
              <span className={`badge ${b.status === 'approved' ? 'badge-green' : b.status === 'eligible' ? 'badge-blue' : b.status === 'applied' ? 'badge-yellow' : 'badge-gray'}`}>{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IPIndiaTab() {
  const [appNum, setAppNum] = useState('');
  const [title, setTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [result, setResult] = useState<GovResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<GovResponse>('/government/ip-india/verify', { application_number: appNum, patent_title: title });
      setResult(res);
      setSearchResults(null);
      toast('Status retrieved');
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<any>('/government/ip-india/search', { query: searchQuery });
      setSearchResults(res);
      setResult(null);
      toast(`Found ${res.total_results} results`);
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>IP India Patent Status</h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Check patent application status, search patents by title/applicant, and estimate filing costs.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="two-col">
        <form onSubmit={handleVerify} style={{ display: 'grid', gap: 12 }}>
          <div className="form-group"><label>Application Number</label>
            <input value={appNum} onChange={e => setAppNum(e.target.value)} placeholder="IN/2024/123456" required />
          </div>
          <div className="form-group"><label>Patent Title (optional)</label>
            <input value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Checking...' : 'Check Status'}</button>
        </form>

        <form onSubmit={handleSearch} style={{ display: 'grid', gap: 12 }}>
          <div className="form-group"><label>Search Patents</label>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="e.g. solar panel, AI, agriculture" required />
          </div>
          <button type="submit" className="btn btn-secondary" disabled={loading}>{loading ? 'Searching...' : 'Search Patents'}</button>
        </form>
      </div>

      <ResultCard data={result} />

      {searchResults && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Search Results ({searchResults.total_results})</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Application No</th><th>Title</th><th>Status</th><th>Applicant</th><th>Filed</th></tr></thead>
              <tbody>
                {searchResults.patents?.map((p: any, i: number) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{p.application_number}</td>
                    <td style={{ fontWeight: 600 }}>{p.title}</td>
                    <td><span className={`badge ${['Granted', 'Filed'].includes(p.status) ? 'badge-green' : ['Rejected', 'Abandoned'].includes(p.status) ? 'badge-red' : 'badge-blue'}`}>{p.status}</span></td>
                    <td>{p.applicant}</td>
                    <td style={{ fontSize: 12 }}>{p.filing_date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ONDCTab() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [products, setProducts] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<GovResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const CATEGORIES = ['Agricultural Products', 'Handicrafts', 'Textiles', 'Food & Beverages', 'Electronics', 'Health & Wellness', 'Education Services', 'Professional Services'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = query
        ? await api.post<any>('/government/ondc/search', { query })
        : await api.get<any>(`/government/ondc/products?category=${category}`);
      setProducts(res);
      setVerifyResult(null);
      toast(`Found ${res.products?.length || 0} products`);
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  const handleVerifySeller = async () => {
    if (!sellerId) { toast('Enter seller ID', 'error'); return; }
    setLoading(true);
    try {
      const res = await api.post<GovResponse>('/government/ondc/verify', { seller_id: sellerId });
      setVerifyResult(res);
      setProducts(null);
      toast(res.status === 'verified' ? 'Seller verified' : 'Seller not found', res.status === 'verified' ? 'success' : 'error');
    } catch (err: any) { toast(err.message, 'error'); }
    setLoading(false);
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>ONDC Marketplace</h3>
      <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Search and verify sellers/products on the Open Network for Digital Commerce. Supports product search and seller verification.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }} className="two-col">
        <form onSubmit={handleSearch} style={{ display: 'grid', gap: 12 }}>
          <div className="form-group"><label>Search Products</label>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. organic rice, handicrafts" />
          </div>
          <div className="form-group"><label>Or Filter by Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Searching...' : 'Search Products'}</button>
        </form>

        <div style={{ display: 'grid', gap: 12 }}>
          <div className="form-group"><label>Verify Seller ID</label>
            <input value={sellerId} onChange={e => setSellerId(e.target.value)} placeholder="SELL123456" />
          </div>
          <button className="btn btn-secondary" onClick={handleVerifySeller} disabled={loading}>Verify Seller</button>
        </div>
      </div>

      <ResultCard data={verifyResult} />

      {products && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Products ({products.products?.length || 0})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {products.products?.map((p: any, i: number) => (
              <div key={i} style={{ padding: 14, background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{p.category || p.fulfillment}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                  <span style={{ fontWeight: 800, color: '#166534' }}>₹{p.price?.toLocaleString()}</span>
                  <div>
                    <span style={{ fontSize: 12, color: '#f59e0b' }}>★ {p.rating}</span>
                    {p.seller && <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8 }}>by {p.seller}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GovernmentPage() {
  const [tab, setTab] = useState<Tab>('aadhaar');

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'aadhaar', label: 'Aadhaar eKYC', icon: '🪪' },
    { key: 'digilocker', label: 'DigiLocker', icon: '📄' },
    { key: 'startup-india', label: 'Startup India', icon: '🚀' },
    { key: 'ip-india', label: 'IP India', icon: '📜' },
    { key: 'ondc', label: 'ONDC', icon: '🛒' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Government Integrations</h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>Connect with Aadhaar, DigiLocker, Startup India, IP India, and ONDC. All responses are mock data in demo mode.</p>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#f3f4f6', padding: 4, borderRadius: 10 }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: tab === t.key ? 'white' : 'transparent', color: tab === t.key ? '#166534' : '#6b7280', boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none', transition: 'all .15s' }}>
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 24 }}>
        {tab === 'aadhaar' && <AadhaarTab />}
        {tab === 'digilocker' && <DigiLockerTab />}
        {tab === 'startup-india' && <StartupIndiaTab />}
        {tab === 'ip-india' && <IPIndiaTab />}
        {tab === 'ondc' && <ONDCTab />}
      </div>
    </div>
  );
}
