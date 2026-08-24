'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';

const STATUS_COLORS: Record<string, string> = {
  open: '#012348', in_progress: '#d97706', resolved: '#b37209', closed: '#6b7280', escalated: '#dc2626',
};

export default function GrievancesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.get<any[]>('/grievances')); }
    catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Grievances" subtitle="Startup grievance redressal" />
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No grievances filed</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((g: any) => (
            <div key={g.id}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{g.subject}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Category: {g.category} &middot; SLA: {g.sla_days} days</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (STATUS_COLORS[g.status] || '#6b7280') + '20', color: STATUS_COLORS[g.status] || '#6b7280' }}>{g.status}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.description}</div>
              {g.resolution && (
                <div style={{ fontSize: 13, color: '#b37209', marginTop: 8, padding: 8, background: '#b3720910', borderRadius: 6 }}><strong>Resolution:</strong> {g.resolution}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
