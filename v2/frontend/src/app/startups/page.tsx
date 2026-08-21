'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn, formatDate, formatCurrency, ENTITY_STAGES, GUJARAT_DISTRICTS, GUJARAT_SECTORS } from '@/lib/utils';
import { Plus, Search, Filter, Edit, Eye, Trash2, Rocket, Users, DollarSign, TrendingUp } from 'lucide-react';

const STARTUP_STAGES = ENTITY_STAGES.startup;

const MOCK_STARTUPS = [
  { id: 1, title: 'ThermaCrop Labs', description: 'Solar cold storage for small farms', stage: 'Pre-seed', district: 'Ahmedabad', sector: 'AgriTech', jobs: 4, users: 80, revenue: 0, impact: 'Reduced post-harvest losses by 30% in pilot farms', parent: 'ThermaCrop Storage Module', owner: 'Aarav Patel', created: '2026-04-10' },
  { id: 2, title: 'CropGuard Technologies', description: 'AI-powered crop disease detection app', stage: 'Seed', district: 'Surat', sector: 'AgriTech', jobs: 12, users: 340, revenue: 850000, impact: '340 farmers using the app across Gujarat', parent: 'CropGuard AI Mobile App', owner: 'Aarav Patel', created: '2026-05-15' },
  { id: 3, title: 'GreenPack Solutions', description: 'Biodegradable packaging from agricultural waste', stage: 'Idea', district: 'Vadodara', sector: 'Materials', jobs: 2, users: 0, revenue: 120000, impact: 'Pilot production line established', parent: 'GreenPack Compostable Material', owner: 'Priya Sharma', created: '2026-06-01' },
  { id: 4, title: 'Smart Irrigate', description: 'IoT-enabled precision irrigation system', stage: 'Pre-seed', district: 'Rajkot', sector: 'AgriTech', jobs: 6, users: 150, revenue: 450000, impact: 'Water savings of 40% for 150 farmers', parent: 'Smart Irrigation Controller', owner: 'Dr. Nisha Shah', created: '2026-06-20' },
  { id: 5, title: 'SoilSense Analytics', description: 'Portable soil health monitoring device', stage: 'Idea', district: 'Junagadh', sector: 'AgriTech', jobs: 3, users: 0, revenue: 0, impact: 'Pre-revenue, pilot testing with 20 farms', parent: 'Low-Cost Soil Health Monitoring', owner: 'Karthik Iyer', created: '2026-07-01' },
];

export default function StartupsPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', stage: 'Idea', district: '', sector: '',
    jobs: 0, users: 0, revenue: 0, impact: '', parent: '',
  });

  const filtered = MOCK_STARTUPS.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || r.stage === stageFilter;
    const matchesDistrict = districtFilter === 'all' || r.district === districtFilter;
    const matchesSector = sectorFilter === 'all' || r.sector === sectorFilter;
    return matchesSearch && matchesStage && matchesDistrict && matchesSector;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreate(false);
    setEditItem(null);
    setFormData({ title: '', description: '', stage: 'Idea', district: '', sector: '', jobs: 0, users: 0, revenue: 0, impact: '', parent: '' });
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      title: item.title, description: item.description, stage: item.stage,
      district: item.district, sector: item.sector, jobs: item.jobs, users: item.users,
      revenue: item.revenue, impact: item.impact, parent: item.parent,
    });
    setShowCreate(true);
  };

  const totalJobs = filtered.reduce((sum, s) => sum + s.jobs, 0);
  const totalUsers = filtered.reduce((sum, s) => sum + s.users, 0);
  const totalRevenue = filtered.reduce((sum, s) => sum + s.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Startups</h1>
          <p className="text-muted-foreground">Track startup journey from idea to growth</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditItem(null); setFormData({ title: '', description: '', stage: 'Idea', district: '', sector: '', jobs: 0, users: 0, revenue: 0, impact: '', parent: '' }); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Startup
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Startups</p><p className="text-3xl font-bold">{filtered.length}</p></div><Rocket className="h-8 w-8 text-gujarat-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Jobs Created</p><p className="text-3xl font-bold">{totalJobs}</p></div><Users className="h-8 w-8 text-blue-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Users Reached</p><p className="text-3xl font-bold">{totalUsers.toLocaleString()}</p></div><TrendingUp className="h-8 w-8 text-green-600" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-3xl font-bold">{formatCurrency(totalRevenue)}</p></div><DollarSign className="h-8 w-8 text-yellow-600" /></div></CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search startups..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
            <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Stages" /></SelectTrigger><SelectContent>{STARTUP_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Districts" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Sectors" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Startups ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Stage</TableHead><TableHead>District</TableHead><TableHead>Sector</TableHead><TableHead>Jobs</TableHead><TableHead>Users</TableHead><TableHead>Revenue</TableHead><TableHead>Impact</TableHead><TableHead className="w-40">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[250px]"><p className="font-medium truncate">{r.title}</p><p className="text-xs text-muted-foreground truncate">{r.description}</p></TableCell>
                    <TableCell><Badge variant="secondary">{r.stage}</Badge></TableCell>
                    <TableCell>{r.district}</TableCell>
                    <TableCell><Badge variant="outline">{r.sector}</Badge></TableCell>
                    <TableCell><Badge variant="default">{r.jobs}</Badge></TableCell>
                    <TableCell>{r.users.toLocaleString()}</TableCell>
                    <TableCell>{formatCurrency(r.revenue)}</TableCell>
                    <TableCell className="max-w-[200px]"><p className="text-xs text-muted-foreground truncate">{r.impact}</p></TableCell>
                    <TableCell><div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => setViewItem(r)} title="View"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Edit"><TrendingUp className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Startup' : 'New Startup'}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); setShowCreate(false); setEditItem(null); setFormData({ title: '', description: '', stage: 'Idea', district: '', sector: '', jobs: 0, users: 0, revenue: 0, impact: '', parent: '' }); }} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="stage">Stage *</Label><Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger><SelectContent>{STARTUP_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="district">District *</Label><Select value={formData.district} onValueChange={v => setFormData({...formData, district: v})}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="sector">Sector *</Label><Select value={formData.sector} onValueChange={v => setFormData({...formData, sector: v})}><SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="jobs">Jobs Created</Label><Input id="jobs" type="number" min="0" value={formData.jobs} onChange={e => setFormData({...formData, jobs: Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label htmlFor="users">Users Reached</Label><Input id="users" type="number" min="0" value={formData.users} onChange={e => setFormData({...formData, users: Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label htmlFor="revenue">Revenue (₹)</Label><Input id="revenue" type="number" min="0" value={formData.revenue} onChange={e => setFormData({...formData, revenue: Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label htmlFor="parent">Linked Innovation</Label><Input id="parent" value={formData.parent} onChange={e => setFormData({...formData, parent: e.target.value})} placeholder="Parent innovation" /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="impact">Impact Description</Label><Textarea id="impact" value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} rows={3} placeholder="Describe the impact..." /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Describe the startup..." /></div>
            </div>
            <Separator /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit">{editItem ? 'Update' : 'Create'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewItem} onOpenChange={open => !open && setViewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewItem?.title}</DialogTitle></DialogHeader>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2"><Badge variant="secondary">{viewItem?.stage}</Badge><Badge variant="outline">{viewItem?.district}</Badge><Badge variant="outline">{viewItem?.sector}</Badge></div>
            <p className="text-muted-foreground">{viewItem?.description}</p>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div><p className="text-xs text-muted-foreground">Jobs</p><p className="font-medium">{viewItem?.jobs}</p></div>
              <div><p className="text-xs text-muted-foreground">Users</p><p className="font-medium">{viewItem?.users.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Revenue</p><p className="font-medium">{formatCurrency(viewItem?.revenue)}</p></div>
              <div className="col-span-3"><p className="text-xs text-muted-foreground">Impact</p><p className="font-medium">{viewItem?.impact}</p></div>
              <div><p className="text-xs text-muted-foreground">Parent</p><p className="font-medium">{viewItem?.parent}</p></div>
              <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium">{viewItem?.owner}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(viewItem?.created)}</p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}