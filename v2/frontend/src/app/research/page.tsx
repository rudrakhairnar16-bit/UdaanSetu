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
import { cn, formatDate, ENTITY_STAGES } from '@/lib/utils';
import { Plus, Search, Filter, Edit, Eye, Trash2, TrendingUp } from 'lucide-react';

const RESEARCH_STAGES = ENTITY_STAGES.research;
const GUJARAT_DISTRICTS = ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Bharuch', 'Navsari', 'Morbi', 'Botad', 'Gir Somnath', 'Devbhoomi Dwarka', 'Porbandar', 'Kutch', 'Patan', 'Mehsana', 'Sabarkantha', 'Banaskantha', 'Aravalli', 'Mahisagar', 'Chhota Udaipur', 'Narmada', 'Tapi', 'Valsad', 'Dang', 'Dahod', 'Amreli', 'Surendranagar', 'Panchmahal', 'Kheda', 'Ahmedabad Rural'];
const GUJARAT_SECTORS = ['AgriTech', 'FoodTech', 'HealthTech', 'FinTech', 'EdTech', 'CleanTech', 'Textiles', 'Pharma', 'Chemicals', 'Automotive', 'IT Services', 'AI/ML', 'IoT', 'SaaS', 'E-Commerce', 'Manufacturing', 'Biotech', 'Renewable Energy', 'Logistics', 'Tourism'];

const MOCK_RESEARCH = [
  { id: 1, title: 'Solar Cold Storage for Small Farms', description: 'Affordable thermal storage and IoT monitoring for post-harvest loss reduction.', stage: 'Prototype', district: 'Ahmedabad', sector: 'AgriTech', progress: 62, institution: 'Gujarat Agricultural University', funding: 750000, owner: 'Aarav Patel', created: '2026-01-15', milestones: 4, overdue: 1 },
  { id: 2, title: 'Water Purification Using Biochar Filters', description: 'Low-cost biochar-based water filtration for arsenic-affected districts.', stage: 'Lab Testing', district: 'Rajkot', sector: 'CleanTech', progress: 38, institution: 'GTU', funding: 500000, owner: 'Priya Sharma', created: '2026-02-20', milestones: 3, overdue: 0 },
  { id: 3, title: 'AI-Powered Crop Disease Detection', description: 'Mobile app using edge AI for real-time plant disease identification.', stage: 'Field Trial', district: 'Surat', sector: 'AgriTech', progress: 75, institution: 'DA-IICT', funding: 400000, owner: 'Aarav Patel', created: '2026-03-10', milestones: 5, overdue: 2 },
  { id: 4, title: 'Biodegradable Packaging from Agricultural Waste', description: 'Converting rice straw and sugarcane bagasse into compostable packaging.', stage: 'Validation', district: 'Vadodara', sector: 'Materials', progress: 55, institution: 'MS University', funding: 600000, owner: 'Priya Sharma', created: '2026-04-05', milestones: 3, overdue: 0 },
  { id: 5, title: 'IoT-Enabled Smart Irrigation System', description: 'Precision irrigation using soil moisture sensors and weather data.', stage: 'Concept', district: 'Rajkot', sector: 'AgriTech', progress: 15, institution: 'GTU', funding: 300000, owner: 'Dr. Nisha Shah', created: '2026-05-01', milestones: 2, overdue: 0 },
  { id: 6, title: 'Low-Cost Soil Health Monitoring', description: 'Portable device for real-time soil nutrient analysis.', stage: 'Lab Testing', district: 'Junagadh', sector: 'AgriTech', progress: 42, institution: 'JAU', funding: 250000, owner: 'Karthik Iyer', created: '2026-04-15', milestones: 3, overdue: 1 },
];

export default function ResearchPage() {
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', stage: 'Draft', district: '', sector: '',
    institution: '', funding: '', progress: 0,
  });

  const filtered = MOCK_RESEARCH.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesStage = stageFilter === 'all' || r.stage === stageFilter;
    const matchesDistrict = districtFilter === 'all' || r.district === districtFilter;
    const matchesSector = sectorFilter === 'all' || r.sector === sectorFilter;
    return matchesSearch && matchesStage && matchesDistrict && matchesSector;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) {
      // Update logic
    } else {
      // Create logic
    }
    setShowCreate(false);
    setEditItem(null);
    setFormData({ title: '', description: '', stage: 'Draft', district: '', sector: '', institution: '', funding: '', progress: 0 });
  };

  const handleEdit = (item: any) => {
    setEditItem(item);
    setFormData({
      title: item.title, description: item.description, stage: item.stage,
      district: item.district, sector: item.sector,
      institution: item.institution, funding: String(item.funding), progress: item.progress,
    });
    setShowCreate(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Research Projects</h1>
          <p className="text-muted-foreground">Track research from concept to validation</p>
        </div>
        <Button onClick={() => { setShowCreate(true); setEditItem(null); setFormData({ title: '', description: '', stage: 'Draft', district: '', sector: '', institution: '', funding: '', progress: 0 }); }}>
          <Plus className="h-4 w-4 mr-2" />
          New Research Project
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Stages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {RESEARCH_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                {GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={sectorFilter} onValueChange={setSectorFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Sectors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Research Projects ({filtered.length})</CardTitle>
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
                  <TableHead>Progress</TableHead>
                  <TableHead>Institution</TableHead>
                  <TableHead>Funding</TableHead>
                  <TableHead>Milestones</TableHead>
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
                    <TableCell>
                      <Badge variant="secondary">{r.stage}</Badge>
                    </TableCell>
                    <TableCell>{r.district}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.sector}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="bg-gujarat-600 h-full rounded-full transition-all" style={{ width: `${r.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{r.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{r.institution}</TableCell>
                    <TableCell>₹{(r.funding / 100000).toFixed(1)}L</TableCell>
                    <TableCell>
                      <Badge variant={r.overdue > 0 ? 'destructive' : 'default'}>
                        {r.milestones} total {r.overdue > 0 && `· ${r.overdue} overdue`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewItem(r)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(r)} title="Edit">
                          <TrendingUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? 'Edit Research Project' : 'New Research Project'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stage">Stage *</Label>
                <Select value={formData.stage} onValueChange={v => setFormData({...formData, stage: v})}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>{RESEARCH_STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District *</Label>
                <Select value={formData.district} onValueChange={v => setFormData({...formData, district: v})}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sector">Sector *</Label>
                <Select value={formData.sector} onValueChange={v => setFormData({...formData, sector: v})}>
                  <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
                  <SelectContent>{GUJARAT_SECTORS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="institution">Institution</Label>
                <Input id="institution" value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} placeholder="Gujarat Agricultural University" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funding">Funding Required (₹)</Label>
                <Input id="funding" type="number" value={formData.funding} onChange={e => setFormData({...formData, funding: e.target.value})} placeholder="750000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input id="progress" type="number" min="0" max="100" value={formData.progress} onChange={e => setFormData({...formData, progress: Number(e.target.value)})} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={4} placeholder="Describe the research project..." />
              </div>
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit">{editItem ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={open => !open && setViewItem(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewItem?.title}</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{viewItem?.stage}</Badge>
              <Badge variant="outline">{viewItem?.district}</Badge>
              <Badge variant="outline">{viewItem?.sector}</Badge>
            </div>
            <p className="text-muted-foreground">{viewItem?.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div><p className="text-xs text-muted-foreground">Institution</p><p className="font-medium">{viewItem?.institution}</p></div>
              <div><p className="text-xs text-muted-foreground">Funding Required</p><p className="font-medium">₹{(viewItem?.funding / 100000).toFixed(1)}L</p></div>
              <div><p className="text-xs text-muted-foreground">Progress</p><p className="font-medium">{viewItem?.progress}%</p></div>
              <div><p className="text-xs text-muted-foreground">Owner</p><p className="font-medium">{viewItem?.owner}</p></div>
              <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{formatDate(viewItem?.created)}</p></div>
              <div><p className="text-xs text-muted-foreground">Milestones</p><p className="font-medium">{viewItem?.milestones} total {viewItem?.overdue > 0 ? `· ${viewItem.overdue} overdue` : ''}</p></div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}