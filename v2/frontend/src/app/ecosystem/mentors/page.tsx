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
import { Plus, Search, Filter, Edit, Eye, Trash2, Users, GraduationCap, Briefcase, MapPin } from 'lucide-react';

const MOCK_MENTORS = [
  { id: 1, title: 'Dr. Nisha Shah', description: 'Former CSIR scientist with 20+ years in agri-tech and cold chain logistics.', stage: 'Available', district: 'Ahmedabad', sector: 'AgriTech', expertise: ['IPR', 'cold chain', 'product development'], bio: 'Former CSIR scientist. Expert in post-harvest technology and technology transfer.', created: '2026-01-15' },
  { id: 2, title: 'Prof. Vikram Menon', description: 'IIT Bombay professor specializing in water purification and biomaterials.', stage: 'Available', district: 'Pune', sector: 'CleanTech', expertise: ['water purification', 'biomaterials', 'sustainability'], bio: 'IIT Bombay professor. Research focus on low-cost water treatment technologies.', created: '2026-02-01' },
  { id: 3, title: 'Ananya Gupta', description: 'Serial entrepreneur with expertise in go-to-market strategies for rural India.', stage: 'Busy', district: 'Mumbai', sector: 'AgriTech', expertise: ['go-to-market', 'rural distribution', 'scaling'], bio: 'Serial entrepreneur. Built and exited 2 agri-tech startups. Mentors early-stage founders.', created: '2026-02-20' },
  { id: 4, title: 'Karthik Iyer', description: 'Top IP law firm veteran specializing in patent strategy for deep-tech startups.', stage: 'Available', district: 'Bangalore', sector: 'IPR', expertise: ['patent drafting', 'IPR strategy', 'licensing'], bio: 'Senior partner at leading IP law firm. 15+ years in patent prosecution and litigation.', created: '2026-03-10' },
  { id: 5, title: 'Dr. Priya Desai', description: 'Agricultural scientist with expertise in soil health and precision farming.', stage: 'Available', district: 'Junagadh', sector: 'AgriTech', expertise: ['soil health', 'precision farming', 'IoT in agriculture'], bio: 'PhD from JAU. Published 30+ papers on soil health monitoring using IoT sensors.', created: '2026-04-01' },
  { id: 6, title: 'Rajesh Patel', description: 'Fintech expert with experience in rural financial inclusion and digital payments.', stage: 'On Leave', district: 'Gandhinagar', sector: 'FinTech', expertise: ['digital payments', 'rural fintech', 'financial inclusion'], bio: 'Former VP at leading payments company. Advisor to RBI on rural fintech policy.', created: '2026-03-25' },
];

export default function MentorsPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', stage: 'Available', district: '', sector: '',
    expertise: '', bio: '',
  });

  const filtered = MOCK_MENTORS.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase()) ||
      r.expertise?.some((e: string) => e.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = stageFilter === 'all' || r.stage === stageFilter;
    const matchesDistrict = districtFilter === 'all' || r.district === districtFilter;
    const matchesSector = sectorFilter === 'all' || r.sector === sectorFilter;
    return matchesSearch && matchesStage && matchesDistrict && matchesSector;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowCreate(false);
    setEditItem(null);
    setFormData({ title: '', description: '', stage: 'Available', district: '', sector: '', expertise: '', bio: '' });
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      title: item.title, description: item.description, stage: item.stage,
      district: item.district, sector: item.sector, expertise: item.expertise?.join(', '), bio: item.bio,
    });
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mentors</h1>
          <p className="text-muted-foreground">Connect with domain experts and industry veterans</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditItem(null); setFormData({ title: '', description: '', stage: 'Available', district: '', sector: '', expertise: '', bio: '' }); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Mentor
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search mentors..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
            <Select value={stageFilter} onValueChange={setStageFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Status" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="Available">Available</SelectItem><SelectItem value="Busy">Busy</SelectItem><SelectItem value="On Leave">On Leave</SelectItem></SelectContent></Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Districts" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}><SelectTrigger className="w-[150px]"><SelectValue placeholder="All Sectors" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between"><CardTitle>Mentors ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>District</TableHead><TableHead>Sector</TableHead><TableHead>Expertise</TableHead><TableHead>Bio</TableHead><TableHead className="w-40">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[200px]"><p className="font-medium">{r.title}</p><p className="text-xs text-muted-foreground truncate">{r.description}</p></TableCell>
                    <TableCell><Badge variant={r.stage === 'Available' ? 'success' : r.stage === 'Busy' ? 'warning' : 'secondary'}>{r.stage}</Badge></TableCell>
                    <TableCell>{r.district}</TableCell>
                    <TableCell><Badge variant="outline">{r.sector}</Badge></TableCell>
                    <TableCell className="max-w-[200px]"><div className="flex flex-wrap gap-1">{r.expertise?.map((e: string) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}</div></TableCell>
                    <TableCell className="max-w-[200px]"><p className="text-xs text-muted-foreground truncate">{r.bio}</p></TableCell>
                    <TableCell><div className="flex items-center gap-1"><Button variant="ghost" size="icon" onClick={() => setViewItem(r)} title="View"><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Edit"><GraduationCap className="h-4 w-4" /></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Mentor' : 'Add Mentor'}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); setShowCreate(false); setEditItem(null); setFormData({ title: '', description: '', stage: 'Available', district: '', sector: '', expertise: '', bio: '' }); }} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="title">Name *</Label><Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="stage">Status *</Label><Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger><SelectContent><SelectItem value="Available">Available</SelectItem><SelectItem value="Busy">Busy</SelectItem><SelectItem value="On Leave">On Leave</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="district">District *</Label><Select value={formData.district} onValueChange={v => setFormData({...formData, district: v})}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="sector">Sector *</Label><Select value={formData.sector} onValueChange={v => setFormData({...formData, sector: v})}><SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="expertise">Expertise (comma-separated)</Label><Input id="expertise" value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})} placeholder="IPR, cold chain, product development" /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} rows={4} placeholder="Brief bio..." /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Brief description..." /></div>
            </div>
            <Separator /><div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit">{editItem ? 'Update' : 'Create'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewItem} onOpenChange={open => !open && setViewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewItem?.title}</DialogTitle></DialogHeader>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2"><Badge variant={viewItem?.stage === 'Available' ? 'success' : viewItem?.stage === 'Busy' ? 'warning' : 'secondary'}>{viewItem?.stage}</Badge><Badge variant="outline">{viewItem?.district}</Badge><Badge variant="outline">{viewItem?.sector}</Badge></div>
            <p className="text-muted-foreground">{viewItem?.description}</p>
            <div className="space-y-3 pt-4 border-t">
              <div><p className="text-xs text-muted-foreground">Expertise</p><div className="flex flex-wrap gap-1">{viewItem?.expertise?.map((e: string) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}</div></div>
              <div><p className="text-xs text-muted-foreground">Bio</p><p className="text-sm">{viewItem?.bio}</p></div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div><p className="text-xs text-muted-foreground">District</p><p className="font-medium">{viewItem?.district}</p></div>
                <div><p className="text-xs text-muted-foreground">Sector</p><p className="font-medium">{viewItem?.sector}</p></div>
                <div><p className="text-xs text-muted-foreground">Added</p><p className="font-medium">{formatDate(viewItem?.created)}</p></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}