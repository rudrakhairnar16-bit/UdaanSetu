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
import { cn, formatDate, GUJARAT_DISTRICTS, GUJARAT_SECTORS } from '@/lib/utils';
import { Plus, Search, Filter, Edit, Eye, Trash2, Trophy, Calendar, IndianRupee, FileText } from 'lucide-react';

const MOCK_SCHEMES = [
  { id: 1, title: 'Prototype Support Grant', description: 'Grant for prototype development in AgriTech and CleanTech sectors.', stage: 'Open', district: 'Gandhinagar', sector: 'AgriTech', amount: 500000, eligibility: 'Prototype stage startups with Gujarat registration', deadline: '2026-12-31', type: 'Grant', created: '2026-01-15' },
  { id: 2, title: 'Rural Innovation Impact Fund', description: 'Equity-free grant for startups creating rural impact in Gujarat.', stage: 'Open', district: 'Gandhinagar', sector: 'General', amount: 2000000, eligibility: 'Startups with rural impact focus', deadline: '2026-10-15', type: 'Equity-free Grant', created: '2026-02-01' },
  { id: 3, title: 'CleanTech Accelerator Program', description: 'Accelerator program with funding and mentorship for CleanTech startups.', stage: 'Open', district: 'Ahmedabad', sector: 'CleanTech', amount: 1000000, eligibility: 'Early-stage CleanTech startups', deadline: '2026-09-01', type: 'Accelerator', created: '2026-03-10' },
  { id: 4, title: 'Deep-Tech Patent Filing Support', description: 'Grant support for patent filing costs for deep-tech innovations.', stage: 'Open', district: 'Gandhinagar', sector: 'General', amount: 200000, eligibility: 'Deep-tech startups filing patents', deadline: '2026-11-30', type: 'Grant', created: '2026-04-01' },
  { id: 5, title: 'Women Entrepreneur Scheme', description: 'Special funding scheme for women-led startups in Gujarat.', stage: 'Upcoming', district: 'Gandhinagar', sector: 'General', amount: 1500000, eligibility: 'Women-led startups with Gujarat registration', deadline: '2027-01-31', type: 'Grant', created: '2026-05-01' },
  { id: 6, title: 'Student Innovation Grant', description: 'Grant for student innovators from Gujarat universities.', stage: 'Open', district: 'Ahmedabad', sector: 'General', amount: 100000, eligibility: 'Students from Gujarat universities', deadline: '2026-12-31', type: 'Grant', created: '2026-06-01' },
];

export default function SchemesPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', stage: 'Open', district: '', sector: '',
    amount: 0, eligibility: '', deadline: '', type: 'Grant',
  });

  const filtered = MOCK_SCHEMES.filter(r => {
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
    setFormData({ title: '', description: '', stage: 'Open', district: '', sector: '', amount: 0, eligibility: '', deadline: '', type: 'Grant' });
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      title: item.title, description: item.description, stage: item.stage,
      district: item.district, sector: item.sector, amount: item.amount,
      eligibility: item.eligibility, deadline: item.deadline, type: item.type,
    });
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Government Schemes</h1>
          <p className="text-muted-foreground">Discover and apply for government funding schemes</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditItem(null); setFormData({ title: '', description: '', stage: 'Open', district: '', sector: '', amount: 0, eligibility: '', deadline: '', type: 'Grant' }); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Scheme
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search schemes..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
            <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Stages" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="Open">Open</SelectItem><SelectItem value="Closed">Closed</SelectItem><SelectItem value="Upcoming">Upcoming</SelectItem></SelectContent></Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Districts" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Sectors" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Schemes ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>District</TableHead><TableHead>Sector</TableHead><TableHead>Amount</TableHead><TableHead>Type</TableHead><TableHead>Deadline</TableHead><TableHead className="w-40">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[250px]"><p className="font-medium truncate">{r.title}</p><p className="text-xs text-muted-foreground truncate">{r.description}</p></TableCell>
                    <TableCell><Badge variant={r.stage === 'Open' ? 'success' : r.stage === 'Upcoming' ? 'info' : 'secondary'}>{r.stage}</Badge></TableCell>
                    <TableCell>{r.district}</TableCell>
                    <TableCell><Badge variant="outline">{r.sector}</Badge></TableCell>
                    <TableCell><IndianRupee className="h-4 w-4 mr-1 inline" />{r.amount.toLocaleString()}</TableCell>
                    <TableCell><Badge variant="secondary">{r.type}</Badge></TableCell>
                    <TableCell><Calendar className="h-4 w-4 mr-1 inline" />{r.deadline}</TableCell>
                    <TableCell><div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => setViewItem(r)} title="View"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Edit"><Trophy className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Scheme' : 'Add Scheme'}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); setShowCreate(false); setEditItem(null); setFormData({ title: '', description: '', stage: 'Open', district: '', sector: '', amount: 0, eligibility: '', deadline: '', type: 'Grant' }); }} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="stage">Status *</Label><Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="Closed">Closed</SelectItem><SelectItem value="Upcoming">Upcoming</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="district">District *</Label><Select value={formData.district} onValueChange={v => setFormData({...formData, district: v})}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="sector">Sector *</Label><Select value={formData.sector} onValueChange={v => setFormData({...formData, sector: v})}><SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="amount">Amount (₹) *</Label><Input id="amount" type="number" min="0" value={formData.amount} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label htmlFor="type">Type *</Label><Select value={formData.type} onValueChange={v => setFormData({...formData, type: v})}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent><SelectItem value="Grant">Grant</SelectItem><SelectItem value="Equity-free Grant">Equity-free Grant</SelectItem><SelectItem value="Accelerator">Accelerator</SelectItem><SelectItem value="Loan">Loan</SelectItem></SelectContent></Select></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="eligibility">Eligibility Criteria *</Label><Textarea id="eligibility" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} rows={3} placeholder="Eligibility criteria..." /></div>
              <div className="space-y-2"><Label htmlFor="deadline">Deadline *</Label><Input id="deadline" type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Scheme description..." /></div>
            </div>
            <Separator /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit">{editItem ? 'Update' : 'Create'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewItem} onOpenChange={open => !open && setViewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewItem?.title}</DialogTitle></DialogHeader>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2"><Badge variant={viewItem?.stage === 'Open' ? 'success' : viewItem?.stage === 'Upcoming' ? 'info' : 'secondary'}>{viewItem?.stage}</Badge><Badge variant="outline">{viewItem?.district}</Badge><Badge variant="outline">{viewItem?.sector}</Badge><Badge variant="secondary">{viewItem?.type}</Badge></div>
            <p className="text-muted-foreground">{viewItem?.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-medium">{viewItem?.amount.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Type</p><p className="font-medium">{viewItem?.type}</p></div>
              <div><p className="text-xs text-muted-foreground">Eligibility</p><p className="font-medium">{viewItem?.eligibility}</p></div>
              <div><p className="text-xs text-muted-foreground">Deadline</p><p className="font-medium">{viewItem?.deadline}</p></div>
              <div><p className="text-xs text-muted-foreground">District</p><p className="font-medium">{viewItem?.district}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(viewItem?.created)}</p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}