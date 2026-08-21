'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const MOCK_AUDIT = [
  { id: 1, action: 'created', entity_type: 'research', entity_id: 1, actor: 'admin@udaansetu.demo', detail: { title: 'Solar Cold Storage for Small Farms' }, created: '2026-08-21T10:00:00' },
  { id: 2, action: 'created', entity_type: 'research', entity_id: 2, actor: 'researcher@udaansetu.demo', detail: { title: 'Water Purification Using Biochar Filters' }, created: '2026-08-21T10:05:00' },
  { id: 3, action: 'updated', entity_type: 'research', entity_id: 1, actor: 'researcher@udaansetu.demo', detail: { title: 'Solar Cold Storage', field: 'stage' }, created: '2026-08-21T11:30:00' },
  { id: 4, action: 'created', entity_type: 'innovation', entity_id: 1, actor: 'researcher@udaansetu.demo', detail: { title: 'ThermaCrop Storage Module' }, created: '2026-08-21T14:00:00' },
  { id: 5, action: 'seeded', entity_type: 'system', entity_id: 0, actor: 'system', detail: { message: 'Demo data seeded' }, created: '2026-08-20T16:00:00' },
  { id: 6, action: 'deleted', entity_type: 'milestone', entity_id: 3, actor: 'admin@udaansetu.demo', detail: { title: 'Old milestone' }, created: '2026-08-20T09:00:00' },
];

const actionColor: Record<string, string> = { created: 'bg-green-100 text-green-800', updated: 'bg-blue-100 text-blue-800', deleted: 'bg-red-100 text-red-800', seeded: 'bg-gray-100 text-gray-800' };

export default function AuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">Admin-only view of all system actions</p>
      </div>
      <Card>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Action</TableHead><TableHead>Entity</TableHead><TableHead>ID</TableHead><TableHead>Actor</TableHead><TableHead>Detail</TableHead></TableRow></TableHeader>
              <TableBody>
                {MOCK_AUDIT.map(l => (
                  <TableRow key={l.id}>
                    <td className="text-sm whitespace-nowrap">{new Date(l.created).toLocaleString()}</td>
                    <td><Badge className={cn(actionColor[l.action])}>{l.action}</Badge></td>
                    <td className="capitalize">{l.entity_type}</td>
                    <td className="font-mono text-sm">{l.entity_id}</td>
                    <td className="text-sm">{l.actor}</td>
                    <td className="text-sm text-muted-foreground max-w-[200px] truncate">{l.detail.title || l.detail.message || JSON.stringify(l.detail)}</td>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}