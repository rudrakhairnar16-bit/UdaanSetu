'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn, formatDate, ENTITY_STAGES, GUJARAT_DISTRICTS, GUJARAT_SECTORS } from '@/lib/utils';
import { Plus, Search, Filter, Edit, Eye, Trash2, TrendingUp, Lightbulb } from 'lucide-react';

const INNOVATION_STAGES = ENTITY_STAGES.innovation;

const MOCK_INNOVATIONS = [
  { id: 1, title: 'ThermaCrop Storage Module', description: 'Phase-change thermal battery for farm cold storage.', stage: 'IPR Screening', district: 'Ahmedabad', sector: 'AgriTech', trl: 'TRL 5', parent: 'Solar Cold Storage for Small Farms', owner: 'Aarav Patel', created: '2026-03-20' },
  { id: 2, title: 'BioChar+ Water Filter Cartridge', description: 'Modular biochar filter with replaceable cartridges.', stage: 'Concept', district: 'Rajkot', sector: 'CleanTech', trl: 'TRL 3', parent: 'Water Purification Using Biochar Filters', owner: 'Priya Sharma', created: '2026-03-25' },
  { id: 3, title: 'CropGuard AI Mobile App', description: 'Edge-AI mobile application for crop disease detection.', stage: 'Ready for Market', district: 'Surat', sector: 'AgriTech', trl: 'TRL 7', parent: 'AI-Powered Crop Disease Detection', owner: 'Aarav Patel', created: '2026-04-15' },
  { id: 4, title: 'GreenPack Compostable Material', description: 'Agricultural waste-based biodegradable packaging.', stage: 'Prototype', district: 'Vadodara', sector: 'Materials', trl: 'TRL 4', parent: 'Biodegradable Packaging from Agricultural Waste', owner: 'Priya Sharma', created: '2026-05-01' },
  { id: 5, title: 'Smart Irrigation Controller', description: 'IoT-enabled precision irrigation using soil moisture sensors.', stage: 'Validation', district: 'Rajkot', sector: 'AgriTech', trl: 'TRL 6', parent: 'IoT-Enabled Smart Irrigation System', owner: 'Dr. Nisha Shah', created: '2026-05-20' },
  { id: 6, title: 'Portable Soil Nutrient Analyzer', description: 'Low-cost portable device for real-time soil health monitoring.', stage: 'Prototype', district: 'Junagadh', sector: 'AgriTech', trl: 'TRL 4', parent: 'Low-Cost Soil Health Monitoring', owner: 'Karthik Iyer', created: '2026-05-10' },
];

export default function InnovationsPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', stage: 'Concept', district: '', sector: '',
    trl: 'TRL 1', parent: '', readiness: '',
  });

  const filtered = MOCK_INNOVATIONS.filter(r => {
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
    setFormData({ title: '', description: '', stage: 'Concept', district: '', sector: '', trl: 'TRL 1', parent: '', readiness: '' });
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      title: item.title, description: item.description, stage: item.stage,
      district: item.district, sector: item.sector, trl: item.trl, parent: item.parent, readiness: item.readiness,
    });
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Innovations</h1>
          <p className="text-muted-foreground">Track innovations from concept to market readiness</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditItem(null); setFormData({ title: '', description: '', stage: 'Concept', district: '', sector: '', trl: 'TRL 1', parent: '', readiness: '' }); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Innovation
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search innovations..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="All Stages" /></SelectTrigger>
              <SelectContent>{INNOVATION_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
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
          <CardTitle>Innovations ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>TRL</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Sector</TableHead>
                  <TableHead>Parent Research</TableHead>
                  <TableHead>Owner</TableHead>
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
                    <TableCell><Badge variant="info">{r.trl}</Badge></TableCell>
                    <TableCell>{r.district}</TableCell>
                    <TableCell><Badge variant="outline">{r.sector}</Badge></TableCell>
                    <TableCell className="max-w-[150px] truncate">{r.parent}</TableCell>
                    <TableCell>{r.owner}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewItem(r)} title="View"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Edit"><TrendingUp className="h-4 w-4" /></Button>
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
          <DialogHeader><DialogTitle>{editItem ? 'Edit Innovation' : 'New Innovation'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="title">Title *</Label><Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></div>
              <div className="space-y-2"><Label htmlFor="stage">Stage *</Label><Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger><SelectContent>{INNOVATION_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="trl">TRL Level *</Label><Select value={formData.trl} onValueChange={v => setFormData({...formData, trl: v})}><SelectTrigger><SelectValue placeholder="Select TRL" /></SelectTrigger><SelectContent>{['TRL 1','TRL 2','TRL 3','TRL 4','TRL 5','TRL 6','TRL 7','TRL 8','TRL 9'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="district">District *</Label><Select value={formData.district} onValueChange={v => setFormData({...formData, district: v})}><SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="sector">Sector *</Label><Select value={formData.sector} onValueChange={v => setFormData({...formData, sector: v})}><SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger><SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="parent">Linked Research</Label><Input id="parent" value={formData.parent} onChange={e => setFormData({...formData, parent: e.target.value})} placeholder="Parent research project" /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Describe the innovation..." /></div>
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
            <div className="flex flex-wrap gap-2"><Badge variant="secondary">{viewItem?.stage}</Badge><Badge variant="info">{viewItem?.trl}</Badge><Badge variant="outline">{viewItem?.district}</Badge><Badge variant="outline">{viewItem?.sector}</Badge></div>
            <p className="text-muted-foreground">{viewItem?.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div><p className="text-xs text-muted-foreground">Parent Research</p><p className="font-medium">{viewItem?.parent}</p></div>
              <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium">{viewItem?.owner}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(viewItem?.created)}</p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}