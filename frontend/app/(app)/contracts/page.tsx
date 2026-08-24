'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { PageHeader, Button } from '../../components/ui';
import { useToast } from '../../components/Toast';

interface Contract {
  id: number;
  pilot_id: number;
  contract_number: string;
  status: string;
  signed_date: string | null;
  expiry_date: string | null;
  value: string;
  meta: Record<string, unknown>;
  created_at: string;
}

interface PurchaseOrder {
  id: number;
  contract_id: number;
  po_number: string;
  status: string;
  amount: string;
  issued_date: string | null;
  meta: Record<string, unknown>;
}

const STATUS_COLORS: Record<string, string> = {
  draft: '#6b7280', active: '#d4880f', completed: '#1a5296', expired: '#ef4444', pending: '#d97706',
};

export default function ContractsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>('/procurements');
      setContracts(data);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (!selectedContract) { setPurchaseOrders([]); return; }
    api.get<any[]>(`/purchase-orders?contract_id=${selectedContract.id}`)
      .then(setPurchaseOrders)
      .catch(() => setPurchaseOrders([]));
  }, [selectedContract]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading contracts...</div>;

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Contracts & Purchase Orders" subtitle="Manage procurement contracts and purchase orders" />

      <div style={{ display: 'grid', gap: 12 }}>
        {contracts.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No contracts found</div>
        ) : (
          contracts.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedContract(c)}
              style={{
                background: 'var(--card)',
                border: selectedContract?.id === c.id ? '2px solid var(--green-500, #16a34a)' : '1px solid var(--border)',
                borderRadius: 10,
                padding: 18,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{c.contract_number || `Contract #${c.id}`}</div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>
                    Value: ₹{c.value || 'N/A'} &middot; Pilot #{c.pilot_id}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: 9999,
                    fontSize: 12,
                    fontWeight: 600,
                    background: (STATUS_COLORS[c.status] || '#6b7280') + '20',
                    color: STATUS_COLORS[c.status] || '#6b7280',
                  }}>
                    {c.status}
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                    {c.signed_date ? new Date(c.signed_date).toLocaleDateString() : ''}
                    {c.expiry_date ? ` — ${new Date(c.expiry_date).toLocaleDateString()}` : ''}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedContract && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: 20,
        }} onClick={() => setSelectedContract(null)}>
          <div
            style={{ background: 'var(--card)', borderRadius: 12, padding: 24, maxWidth: 560, width: '100%', maxHeight: '80vh', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Contract: {selectedContract.contract_number || selectedContract.id}
            </h2>
            <div style={{ display: 'grid', gap: 10, fontSize: 14 }}>
              <div><strong>Status:</strong> {selectedContract.status}</div>
              <div><strong>Value:</strong> ₹{selectedContract.value || 'N/A'}</div>
              <div><strong>Signed:</strong> {selectedContract.signed_date ? new Date(selectedContract.signed_date).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Expiry:</strong> {selectedContract.expiry_date ? new Date(selectedContract.expiry_date).toLocaleDateString() : 'N/A'}</div>
              {selectedContract.meta && Object.keys(selectedContract.meta).length > 0 && (
                <div>
                  <strong>Additional Details:</strong>
                  <pre style={{ marginTop: 4, fontSize: 11, background: 'var(--gray-50, #f9fafb)', padding: 8, borderRadius: 6, overflow: 'auto' }}>
                    {JSON.stringify(selectedContract.meta, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {purchaseOrders.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Purchase Orders</h3>
                {purchaseOrders.map((po) => (
                  <div key={po.id} style={{ padding: 10, background: 'var(--gray-50, #f9fafb)', borderRadius: 8, marginBottom: 8, fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600 }}>{po.po_number || `PO #${po.id}`}</span>
                      <span style={{ color: STATUS_COLORS[po.status] || '#6b7280' }}>{po.status}</span>
                    </div>
                    <div style={{ color: 'var(--gray-500)', marginTop: 2 }}>Amount: ₹{po.amount || 'N/A'}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={() => setSelectedContract(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
