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
import { cn, formatDate, ENTITY_STAGES, GUJARAT_DISTRICTS, GUJARAT_SECTORS } from '@/lib/utils';
import { Plus, Search, Filter, Edit, Eye, Trash2, FileText, ArrowRight } from 'lucide-react';

const IPR_STAGES = ENTITY_STAGES.ipr;

const MOCK_IPR = [
  { id: 1, title: 'ThermaCrop provisional patent', description: 'Phase-change thermal battery for farm cold storage.', stage: 'Filed', district: 'Ahmedabad', sector: 'AgriTech', filingDate: '2026-03-15', applicationNo: 'IN/2026/41234', parent: 'ThermaCrop Storage Module', owner: 'Aarav Patel', created: '2026-03-20' },
  { id: 2, title: 'CropGuard AI algorithm patent', description: 'Edge-AI mobile application for crop disease detection.', stage: 'Examination', district: 'Surat', sector: 'AgriTech', filingDate: '2025-11-20', applicationNo: 'IN/2025/98765', parent: 'CropGuard AI Mobile App', owner: 'Aarav Patel', created: '2025-12-01' },
  { id: 3, title: 'GreenPack material composition', description: 'Agricultural waste-based biodegradable packaging.', stage: 'Screening', district: 'Vadodara', sector: 'Materials', filingDate: '2026-06-01', applicationNo: 'IN/2026/55678', parent: 'GreenPack Compostable Material', owner: 'Priya Sharma', created: '2026-06-05' },
  { id: 4, title: 'Smart Irrigation Controller Patent', description: 'IoT-enabled precision irrigation using soil moisture sensors.', stage: 'Filed', district: 'Rajkot', sector: 'AgriTech', filingDate: '2026-07-10', applicationNo: 'IN/2026/78901', parent: 'Smart Irrigation Controller', owner: 'Dr. Nisha Shah', created: '2026-07-15' },
  { id: 5, title: 'BioChar+ Filter Design Patent', description: 'Modular biochar filter with replaceable cartridges.', stage: 'Idea', district: 'Rajkot', sector: 'CleanTech', filingDate: '', applicationNo: '', parent: 'BioChar+ Water Filter Cartridge', owner: 'Priya Sharma', created: '2026-06-20' },
];

export default function IPRPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', stage: 'Idea', district: '', sector: '',
    filingDate: '', applicationNo: '', parent: '',
  });

  const filtered = MOCK_IPR.filter(r => {
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
    setFormData({ title: '', description: '', stage: 'Idea', district: '', sector: '', filingDate: '', applicationNo: '', parent: '' });
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      title: item.title, description: item.description, stage: item.stage,
      district: item.district, sector: item.sector, filingDate: item.filingDate, applicationNo: item.applicationNo, parent: item.parent,
    });
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">IPR / Patents</h1>
          <p className="text-muted-foreground">Manage intellectual property from idea to grant</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditItem(null); setFormData({ title: '', description: '', stage: 'Idea', district: '', sector: '', filingDate: '', applicationNo: '', parent: '' }); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Patent Record
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search patents..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Stages" /></SelectTrigger>
              <SelectContent>{IPR_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Districts" /></SelectTrigger>
              <SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Sectors" /></SelectTrigger>
              <SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>IPR Records ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Filing Date</TableHead>
                  <TableHead>Application No.</TableHead>
                  <TableHead>Parent Innovation</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[250px]">
                      <p className="font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{r.stage}</Badge></TableCell>
                    <TableCell>{r.district}</TableCell>
                    <TableCell><Badge variant="outline">{r.sector}</Badge></TableCell>
                    <TableCell>{r.filingDate || '—'}</TableCell>
                    <TableCell className="font-mono text-sm">{r.applicationNo || '—'}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{r.parent}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewItem(r)} title="View"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Edit"><ArrowRight className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem ? 'Edit Patent Record' : 'New Patent Record'}</DialogTitle></DialogHeader>
          <form onSubmit={e => { e.preventDefault(); setShowCreate(false); setEditItem(null); setFormData({ title: '', description: '', stage: 'Idea', district: '', sector: '', filingDate: '', applicationNo: '', parent: '' }); }} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="stage">Stage *</Label><Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger><SelectContent>{IPR_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="district">District *</Label><Select value={formData.district} onValueChange={v => setFormData({...formData, district: v})}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="sector">Sector *</Label><Select value={formData.sector} onValueChange={v => setFormData({...formData, sector: v})}><SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="filingDate">Filing Date</Label><Input id="filingDate" type="date" value={formData.filingDate} onChange={e => setFormData({...formData, filingDate: e.target.value})} /></div>
              <div className="space-y-2"><Label htmlFor="applicationNo">Application No.</Label><Input id="applicationNo" value={formData.applicationNo} onChange={e => setFormData({...formData, applicationNo: e.target.value})} placeholder="IN/2026/XXXXX" /></div>
              <div className="space-y-2"><Label htmlFor="parent">Linked Innovation</Label><Input id="parent" value={formData.parent} onChange={e => setFormData({...formData, parent: e.target.value})} placeholder="Parent innovation" /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Describe the patent..." /></div>
            </div>
            <Separator />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit">{editItem ? 'Update' : 'Create'}</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewItem} onOpenChange={open => !open && setViewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{viewItem?.title}</DialogTitle></DialogHeader>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2"><Badge variant="secondary">{viewItem?.stage}</Badge><Badge variant="outline">{viewItem?.district}</Badge><Badge variant="outline">{viewItem?.sector}</Badge></div>
            <p className="text-muted-foreground">{viewItem?.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div><p className="text-xs text-muted-foreground">Parent Innovation</p><p className="font-medium">{viewItem?.parent}</p></div>
              <div><p className="text-xs text-muted-foreground">Application No.</p><p className="font-medium font-mono">{viewItem?.applicationNo}</p></div>
              <div><p className="text-xs text-muted-foreground">Filing Date</p><p className="font-medium">{viewItem?.filingDate || '—'}</p></div>
              <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium">{viewItem?.owner}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(viewItem?.created)}</p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}