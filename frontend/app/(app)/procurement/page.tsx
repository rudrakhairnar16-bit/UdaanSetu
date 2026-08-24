'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, procurements } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

const STATUS_COLORS: Record<string, string> = {
  recommended: '#012348', pending: '#d97706', approved: '#b37209', rejected: '#dc2626', completed: '#b37209',
};

export default function ProcurementPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const canManage = user?.role === 'procurement_officer' || user?.role === 'govt_officer' || user?.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await procurements.list()); }
    catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id: number) => {
    if (!await confirm('Approve this procurement?')) return;
    await procurements.approve(id);
    toast('Procurement approved', 'success');
    load();
  };

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Procurement" subtitle="Procurement recommendations and references" />
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No procurements found</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((p: any) => (
            <div key={p.id}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Pilot #{p.pilot_id} — Procurement #{p.id}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Method: {p.procurement_method || 'TBD'}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (STATUS_COLORS[p.status] || '#6b7280') + '20', color: STATUS_COLORS[p.status] || '#6b7280' }}>{p.status}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (STATUS_COLORS[p.approval_status] || '#6b7280') + '20', color: STATUS_COLORS[p.approval_status] || '#6b7280' }}>Approval: {p.approval_status}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12, fontSize: 13, color: 'var(--gray-500)' }}>
                <div><strong>Estimated:</strong> {p.estimated_value || 'TBD'}</div>
                <div><strong>Approved:</strong> {p.approved_value || 'Pending'}</div>
                <div><strong>Authority:</strong> {p.approving_authority || 'N/A'}</div>
              </div>
              {p.external_reference_type && (
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 8 }}>External Ref: {p.external_reference_type} — {p.external_reference_id}</div>
              )}
              {canManage && p.approval_status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <Button onClick={() => handleApprove(p.id)} style={{ background: '#b37209', color: '#fff', fontSize: 13, padding: '6px 14px' }}>Approve</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
