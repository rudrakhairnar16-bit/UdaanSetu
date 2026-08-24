'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';

const OUTCOME_COLORS: Record<string, string> = { pending: '#6b7280', success: '#b37209', conditional: '#d97706', fail: '#dc2626' };
const REC_COLORS: Record<string, string> = { pending: '#6b7280', procure: '#b37209', scale: '#012348', re_pilot: '#d97706', improve: '#7c3aed', close: '#dc2626' };

export default function ValidationPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any>(null);
  const canValidate = user?.role === 'validator' || user?.role === 'admin';

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.get<any[]>('/validations')); }
    catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Independent Validation" subtitle="Pilot outcome validation workspace" />
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No validations yet</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map((v: any) => (
            <div key={v.id} onClick={() => setDetail(v)}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Pilot #{v.pilot_id} — Validation #{v.id}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (OUTCOME_COLORS[v.outcome] || '#6b7280') + '20', color: OUTCOME_COLORS[v.outcome] || '#6b7280' }}>{v.outcome}</span>
                  <span style={{ padding: '3px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600, background: (REC_COLORS[v.recommendation] || '#6b7280') + '20', color: REC_COLORS[v.recommendation] || '#6b7280' }}>{v.recommendation}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 10, fontSize: 12, color: 'var(--gray-500)' }}>
                <div>KPI: <strong>{v.kpi_achievement_pct}%</strong></div>
                <div>Cost: <strong>{v.cost_efficiency_pct}%</strong></div>
                <div>Security: <strong>{v.security_score}</strong></div>
                <div>Scale: <strong>{v.scalability_score}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
      {detail && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginTop: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Validation #{detail.id}</h2>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>{detail.rationale || 'No rationale provided'}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}><strong>Evidence Review:</strong> {detail.evidence_review || 'N/A'}</div>
          <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
        </div>
      )}
    </div>
  );
}
