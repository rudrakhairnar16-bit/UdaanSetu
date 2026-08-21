'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { FileCheck, Shield, Rocket, Search, ShoppingCart } from 'lucide-react';

function ResultCard({ data }: { data: any }) {
  if (!data) return null;
  const statusColors: Record<string, string> = { verified: 'bg-green-100 text-green-800', registered: 'bg-green-100 text-green-800', ok: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', failed: 'bg-red-100 text-red-800' };
  return (
    <Card className="mt-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium">Result</p>
          <Badge className={cn(statusColors[data.status] || 'bg-gray-100 text-gray-800')}>{data.status?.toUpperCase()}</Badge>
        </div>
        {data.message && <p className="text-sm text-muted-foreground mb-3">{data.message}</p>}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(data).filter(([k]) => !['status', 'message', 'service', 'timestamp', 'request_id'].includes(k)).map(([k, v]) => (
            <div key={k} className="p-2 bg-muted/30 rounded">
              <p className="text-xs text-muted-foreground uppercase">{k.replace(/_/g, ' ')}</p>
              <p className="text-sm font-medium">{String(v)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AadhaarTab() {
  const [aadhaar, setAadhaar] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setResult({ status: 'verified', message: 'Aadhaar verified successfully', aadhaar_number: aadhaar, name: name || 'Demo User' });
    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-1">Aadhaar eKYC</h3>
      <p className="text-sm text-muted-foreground mb-4">Verify identity using Aadhaar number</p>
      <form onSubmit={handleVerify} className="space-y-3 max-w-sm">
        <div className="space-y-1"><Label>Aadhaar Number (12 digits)</Label><Input value={aadhaar} onChange={e => setAadhaar(e.target.value)} placeholder="1234 5678 9012" maxLength={14} required /></div>
        <div className="space-y-1"><Label>Name (optional)</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Name as on Aadhaar" /></div>
        <div className="flex gap-2"><Button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify Aadhaar'}</Button></div>
      </form>
      <ResultCard data={result} />
    </div>
  );
}

function DigiLockerTab() {
  const [docType, setDocType] = useState('aadhaar');
  const [docId, setDocId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setResult({ status: 'verified', message: 'Document verified via DigiLocker', document_type: docType, document_id: docId || 'DEMO-DOC' });
    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-1">DigiLocker Documents</h3>
      <p className="text-sm text-muted-foreground mb-4">Verify documents through DigiLocker</p>
      <form onSubmit={handleVerify} className="space-y-3 max-w-sm">
        <div className="space-y-1"><Label>Document Type</Label><Select value={docType} onValueChange={setDocType}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="aadhaar">Aadhaar Card</SelectItem><SelectItem value="pan">PAN Card</SelectItem><SelectItem value="driving_license">Driving License</SelectItem><SelectItem value="voter_id">Voter ID</SelectItem><SelectItem value="degree">Degree Certificate</SelectItem></SelectContent></Select></div>
        <div className="space-y-1"><Label>Document ID (optional)</Label><Input value={docId} onChange={e => setDocId(e.target.value)} placeholder="Document number" /></div>
        <Button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify Document'}</Button>
      </form>
      <ResultCard data={result} />
    </div>
  );
}

function StartupIndiaTab() {
  const [regNum, setRegNum] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setResult({ status: 'verified', message: 'Startup verified on Startup India', registration_number: regNum, startup_name: name || 'Demo Startup', dpiit_recognized: true });
    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-1">Startup India Registry</h3>
      <p className="text-sm text-muted-foreground mb-4">Verify DPIIT recognition and benefits</p>
      <form onSubmit={handleVerify} className="space-y-3 max-w-sm">
        <div className="space-y-1"><Label>Registration Number</Label><Input value={regNum} onChange={e => setRegNum(e.target.value)} placeholder="SUP123456" required /></div>
        <div className="space-y-1"><Label>Startup Name (optional)</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
        <Button type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify Registration'}</Button>
      </form>
      <ResultCard data={result} />
    </div>
  );
}

function IPIndiaTab() {
  const [appNum, setAppNum] = useState('');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setResult({ status: 'verified', message: 'Patent application found', application_number: appNum, patent_title: title || 'Demo Patent', patent_status: 'Filed', applicant: 'Demo Applicant', filing_date: '2026-01-15' });
    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-1">IP India Patent Status</h3>
      <p className="text-sm text-muted-foreground mb-4">Check patent application status and search patents</p>
      <form onSubmit={handleVerify} className="space-y-3 max-w-sm">
        <div className="space-y-1"><Label>Application Number</Label><Input value={appNum} onChange={e => setAppNum(e.target.value)} placeholder="IN/2026/123456" required /></div>
        <div className="space-y-1"><Label>Patent Title (optional)</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
        <Button type="submit" disabled={loading}>{loading ? 'Checking...' : 'Check Status'}</Button>
      </form>
      <ResultCard data={result} />
    </div>
  );
}

function ONDCTab() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [sellerId, setSellerId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setResult({ status: 'ok', message: `Found 12 products for "${query || category}"`, products_found: 12 });
    setLoading(false);
  };

  const handleVerifySeller = async () => {
    if (!sellerId) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setResult({ status: 'verified', message: 'Seller verified on ONDC', seller_id: sellerId, rating: 4.5, products_listed: 23 });
    setLoading(false);
  };

  return (
    <div>
      <h3 className="text-lg font-bold mb-1">ONDC Marketplace</h3>
      <p className="text-sm text-muted-foreground mb-4">Search and verify sellers/products on ONDC</p>
      <div className="grid grid-cols-2 gap-4 max-w-lg">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="space-y-1"><Label>Search Products</Label><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="organic rice, handicrafts" /></div>
          <div className="space-y-1"><Label>Category</Label><Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="agriculture">Agricultural Products</SelectItem><SelectItem value="handicrafts">Handicrafts</SelectItem><SelectItem value="textiles">Textiles</SelectItem><SelectItem value="food">Food & Beverages</SelectItem></SelectContent></Select></div>
          <Button type="submit" disabled={loading}>{loading ? 'Searching...' : 'Search Products'}</Button>
        </form>
        <div className="space-y-3">
          <div className="space-y-1"><Label>Verify Seller ID</Label><Input value={sellerId} onChange={e => setSellerId(e.target.value)} placeholder="SELL123456" /></div>
          <Button variant="outline" onClick={handleVerifySeller} disabled={loading}>Verify Seller</Button>
        </div>
      </div>
      <ResultCard data={result} />
    </div>
  );
}

export default function GovtPage() {
  const [tab, setTab] = useState('aadhaar');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Government Integrations</h1>
        <p className="text-muted-foreground">Connect with Aadhaar, DigiLocker, Startup India, IP India, and ONDC. All responses are mock data in demo mode.</p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="aadhaar">Aadhaar eKYC</TabsTrigger>
          <TabsTrigger value="digilocker">DigiLocker</TabsTrigger>
          <TabsTrigger value="startup-india">Startup India</TabsTrigger>
          <TabsTrigger value="ip-india">IP India</TabsTrigger>
          <TabsTrigger value="ondc">ONDC</TabsTrigger>
        </TabsList>
        <Card className="mt-4"><CardContent className="p-6">
          <TabsContent value="aadhaar"><AadhaarTab /></TabsContent>
          <TabsContent value="digilocker"><DigiLockerTab /></TabsContent>
          <TabsContent value="startup-india"><StartupIndiaTab /></TabsContent>
          <TabsContent value="ip-india"><IPIndiaTab /></TabsContent>
          <TabsContent value="ondc"><ONDCTab /></TabsContent>
        </CardContent></Card>
      </Tabs>
    </div>
  );
}