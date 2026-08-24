'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, evaluations as evalApi } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Evaluation } from '../../lib/types';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';

const STATUS_COLORS: Record<string, string> = {
  pending: '#6b7280', submitted: '#012348', shortlisted: '#d97706', rejected: '#dc2626', approved: '#b37209',
};

export default function EvaluationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<Evaluation | null>(null);
  const canCreate = user?.role === 'evaluator' || user?.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await evalApi.list('')); }
    catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Evaluations" subtitle="Expert evaluation committee workspace" />
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No evaluations found</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} onClick={() => setDetail(item)}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Challenge #{item.challenge_id} → Startup #{item.startup_id}</div>
                <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: '#7c3aed20', color: '#7c3aed' }}>Evaluator #{item.evaluator_id}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--gray-400)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.comments}</div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: 'var(--gray-500)' }}>
                <span>Scores: {Object.keys(item.scores).length} criteria</span>
                <span>{item.evaluated_at ? new Date(item.evaluated_at).toLocaleDateString() : 'Not yet'}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {detail && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginTop: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Evaluation Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, marginBottom: 16 }}>
            <div><strong>Challenge:</strong> #{detail.challenge_id}</div>
            <div><strong>Startup:</strong> #{detail.startup_id}</div>
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Scores</h3>
          <div style={{ display: 'grid', gap: 6, marginBottom: 16 }}>
            {Object.entries(detail.scores).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: 13 }}>
                <span>{k.replace(/_/g, ' ')}</span>
                <span style={{ fontWeight: 600 }}>{typeof v === 'number' ? v.toFixed(1) : v}/10</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}><strong>Comments:</strong> {detail.comments}</div>
          <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
        </div>
      )}
    </div>
  );
}
