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
import { Plus, Search, Filter, Edit, Eye, Trash2, Building2, Users, Briefcase, MapPin } from 'lucide-react';

const MOCK_INCUBATORS = [
  { id: 1, title: 'IIM-A CIIE', description: 'Premier incubation center at IIM Ahmedabad with focus on social enterprise and deep tech.', stage: 'Open', district: 'Ahmedabad', sector: 'General', capacity: 50, services: ['mentorship', 'funding access', 'office space', 'network'], contact: 'info@iima.in', created: '2026-01-01' },
  { id: 2, title: 'GVFL Startup Hub', description: 'Gujarat Venture Finance Limited\'s incubation arm with strong investor network.', stage: 'Open', district: 'Ahmedabad', sector: 'General', capacity: 30, services: ['funding', 'mentorship', 'market access', 'legal support'], contact: 'startups@gvfl.com', created: '2026-01-15' },
  { id: 3, title: 'iHub Gujarat', description: 'Government-supported incubator with focus on deep tech and IP-rich startups.', stage: 'Open', district: 'Gandhinagar', sector: 'DeepTech', capacity: 40, services: ['IP support', 'lab access', 'government connects', 'funding'], contact: 'contact@ihubgujarat.in', created: '2026-02-01' },
  { id: 4, title: 'EDII Incubator', description: 'Entrepreneurship Development Institute of India incubator for social enterprises.', stage: 'Open', district: 'Ahmedabad', sector: 'Social', capacity: 25, services: ['social impact mentoring', 'grant access', 'rural market access'], contact: 'incubator@ediindia.org', created: '2026-02-15' },
  { id: 5, title: 'GTU Innovation Council', description: 'Gujarat Technological University\'s incubator for student and faculty startups.', stage: 'Open', district: 'Ahmedabad', sector: 'EdTech', capacity: 60, services: ['academic mentoring', 'lab access', 'student talent', 'IP filing'], contact: 'ic@gtu.ac.in', created: '2026-03-01' },
  { id: 6, title: 'SURATi iLAB', description: 'Surat-based incubator focusing on diamond tech, textiles, and manufacturing innovation.', stage: 'Open', district: 'Surat', sector: 'Manufacturing', capacity: 20, services: ['manufacturing access', 'industry connects', 'export support'], contact: 'ilab@surat.gov.in', created: '2026-04-01' },
];

export default function IncubatorsPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', stage: 'Open', district: '', sector: '',
    capacity: 0, services: '', contact: '',
  });

  const filtered = MOCK_INCUBATORS.filter(r => {
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
    setFormData({ title: '', description: '', stage: 'Open', district: '', sector: '', capacity: 0, services: '', contact: '' });
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      title: item.title, description: item.description, stage: item.stage,
      district: item.district, sector: item.sector, capacity: item.capacity,
      services: item.services?.join(', '), contact: item.contact,
    });
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Incubators</h1>
          <p className="text-muted-foreground">Find incubation support for your startup journey</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditItem(null); setFormData({ title: '', description: '', stage: 'Open', district: '', sector: '', capacity: 0, services: '', contact: '' }); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Incubator
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search incubators..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
            <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="Open">Open</SelectItem><SelectItem value="Full">Full</SelectItem><SelectItem value="Selective">Selective</SelectItem></SelectContent></Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Districts" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Sectors" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Incubators ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>District</TableHead><TableHead>Sector</TableHead><TableHead>Capacity</TableHead><TableHead>Services</TableHead><TableHead>Contact</TableHead><TableHead className="w-40">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[200px]"><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground truncate">{r.description}</p></TableCell>
                    <TableCell><Badge variant={r.stage === 'Open' ? 'success' : 'secondary'}>{r.stage}</Badge></TableCell>
                    <TableCell>{r.district}</TableCell>
                    <TableCell><Badge variant="outline">{r.sector}</Badge></TableCell>
                    <TableCell><Users className="h-4 w-4 mr-1 inline" />{r.capacity}</TableCell>
                    <TableCell className="max-w-[200px]"><div className="flex flex-wrap gap-1">{r.services?.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div></TableCell>
                    <TableCell><p className="text-xs text-muted-foreground">{r.contact}</p></TableCell>
                    <TableCell><div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => setViewItem(r)} title="View"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Edit"><Building2 className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Incubator' : 'Add Incubator'}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); setShowCreate(false); setEditItem(null); setFormData({ title: '', description: '', stage: 'Open', district: '', sector: '', capacity: 0, services: '', contact: '' }); }} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="title">Name *</Label><Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="stage">Status *</Label><Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Open">Open</SelectItem><SelectItem value="Full">Full</SelectItem><SelectItem value="Selective">Selective</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="district">District *</Label><Select value={formData.district} onValueChange={v => setFormData({...formData, district: v})}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="sector">Sector *</Label><Select value={formData.sector} onValueChange={v => setFormData({...formData, sector: v})}><SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="capacity">Capacity *</Label><Input id="capacity" type="number" min="0" value={formData.capacity} onChange={e => setFormData({...formData, capacity: Number(e.target.value)})} /></div>
              <div className="space-y-2"><Label htmlFor="contact">Contact Email *</Label><Input id="contact" type="email" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} placeholder="contact@example.com" /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="services">Services (comma-separated)</Label><Input id="services" value={formData.services} onChange={e => setFormData({...formData, services: e.target.value})} placeholder="mentorship, funding, lab access" /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Incubator description..." /></div>
            </div>
            <Separator /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit">{editItem ? 'Update' : 'Create'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewItem} onOpenChange={open => !open && setViewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewItem?.title}</DialogTitle></DialogHeader>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2"><Badge variant={viewItem?.stage === 'Open' ? 'success' : 'secondary'}>{viewItem?.stage}</Badge><Badge variant="outline">{viewItem?.district}</Badge><Badge variant="outline">{viewItem?.sector}</Badge></div>
            <p className="text-muted-foreground">{viewItem?.description}</p>
            <div className="space-y-3 pt-4 border-t">
              <div><p className="text-xs text-muted-foreground">Services</p><div className="flex flex-wrap gap-1">{viewItem?.services?.map((s: string) => <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>)}</div></div>
              <div><p className="text-xs text-muted-foreground">Contact</p><p className="text-sm">{viewItem?.contact}</p></div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div><p className="text-xs text-muted-foreground">Capacity</p><p className="font-medium">{viewItem?.capacity}</p></div>
                <div><p className="text-xs text-muted-foreground">District</p><p className="font-medium">{viewItem?.district}</p></div>
                <div><p className="text-xs text-muted-foreground">Added</p><p className="font-medium">{formatDate(viewItem?.created)}</p></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}