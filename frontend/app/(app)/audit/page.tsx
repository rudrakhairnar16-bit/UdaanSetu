'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { AuditLog } from '../../lib/types';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<AuditLog[]>('/audit')
      .then(d => { setLogs(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  const actionColor: Record<string, string> = {
    created: '#d4880f', updated: '#1a5296', deleted: 'var(--red-500)',
    seeded: '#9ca3af', uploaded_document: '#f97316',
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Audit Log</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Admin-only view of system actions</p>
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div>
        : error ? <div style={{ padding: 40, color: 'var(--red-500)' }}>Error: {error}</div>
        : logs.length === 0 ? <div className="empty"><div style={{ fontSize: 40 }}>📋</div><p>No audit logs</p></div>
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>ID</th>
                    <th>Actor</th>
                    <th>Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(l => (
                    <tr key={l.id}>
                      <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleString()}</td>
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '2px 10px', borderRadius: 9999, fontSize: 12, fontWeight: 600,
                          background: `${actionColor[l.action] || 'var(--gray-500)'}15`, color: actionColor[l.action] || 'var(--gray-500)',
                        }}>
                          {l.action}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500, textTransform: 'capitalize' }}>{l.entity}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{l.entity_id}</td>
                      <td style={{ fontSize: 13 }}>#{l.actor_id || '—'}</td>
                      <td style={{ fontSize: 13, color: 'var(--gray-500)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.detail.title || JSON.stringify(l.detail)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
