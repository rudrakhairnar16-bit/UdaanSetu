'use client';

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Notification } from '../../lib/types';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';
import { LoadingSpinner } from '../../components/LoadingSpinner';

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.get<Notification[]>('/notifications');
      setNotifs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
      toast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err: any) {
      toast('Failed to mark as read', 'error');
    }
  };

  const markAllRead = async () => {
    const ok = await confirm('Mark all notifications as read?');
    if (!ok) return;
    try {
      await api.post('/notifications/read-all');
      setNotifs(notifs.map(n => ({ ...n, read: true })));
      toast('All notifications marked as read');
    } catch (err: any) {
      toast('Failed to mark all as read', 'error');
    }
  };

  const unread = notifs.filter(n => !n.read).length;

  const kindIcon: Record<string, string> = { info: 'ℹ️', action: '⚡', warning: '⚠️', system: '🔧' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>Notifications</h1>
          <p style={{ fontSize: 13, color: '#6b7280' }}>{unread} unread</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-secondary" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      {loading ? <LoadingSpinner text="Loading notifications..." /> : error ? (
        <div className="card" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#ef4444', marginBottom: 12 }}>{error}</p>
          <button className="btn btn-primary btn-sm" onClick={load}>Retry</button>
        </div>
      ) : notifs.length === 0 ? (
        <div className="empty"><div style={{ fontSize: 40 }}>🔔</div><p>No notifications yet</p></div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {notifs.map(n => (
            <div
              key={n.id}
              style={{
                padding: '14px 18px',
                borderRadius: 10,
                border: `1px solid ${n.read ? '#e5e7eb' : '#bbf7d0'}`,
                background: n.read ? 'white' : '#f0fdf4',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: n.read ? 'default' : 'pointer',
                transition: 'all .15s',
              }}
              onClick={() => !n.read && markRead(n.id)}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, marginTop: 2 }}>{kindIcon[n.kind] || '📌'}</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, color: '#374151' }}>{n.message}</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{new Date(n.created_at).toLocaleString()}</p>
                </div>
              </div>
              {!n.read && (
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
