'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Bell, Check, AlertCircle, Info, Zap } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 1, kind: 'info', message: 'Welcome to Gujarat Innovation Ecosystem!', read: false, created: '2026-08-21T10:00:00' },
  { id: 2, kind: 'action', message: '2 funding requests pending review', read: false, created: '2026-08-21T09:30:00' },
  { id: 3, kind: 'system', message: 'System seeded with demo data', read: true, created: '2026-08-20T16:00:00' },
  { id: 4, kind: 'warning', message: 'ThermaCrop Storage Module milestones overdue', read: false, created: '2026-08-20T14:30:00' },
  { id: 5, kind: 'info', message: 'CropGuard AI Mobile App stage advanced to Ready for Market', read: true, created: '2026-08-19T11:00:00' },
  { id: 6, kind: 'action', message: 'New mentor Dr. Priya Desai joined the platform', read: true, created: '2026-08-18T09:00:00' },
];

const kindIcon: Record<string, any> = { info: Info, action: Zap, warning: AlertCircle, system: Check };
const kindColor: Record<string, string> = { info: 'text-blue-600', action: 'text-yellow-600', warning: 'text-red-600', system: 'text-green-600' };

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK_NOTIFICATIONS);

  const markRead = (id: number) => {
    setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifs(notifs.map(n => ({ ...n, read: true })));
  };

  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unread} unread notification{unread !== 1 ? 's' : ''}</p>
        </div>
        {unread > 0 && <Button variant="outline" onClick={markAllRead}><Check className="h-4 w-4 mr-2" />Mark all as read</Button>}
      </div>

      <div className="space-y-3">
        {notifs.map(n => {
          const Icon = kindIcon[n.kind] || Bell;
          return (
            <Card key={n.id} className={cn('transition-colors cursor-pointer', !n.read && 'bg-green-50 border-green-200')} onClick={() => !n.read && markRead(n.id)}>
              <CardContent className="p-4 flex items-start gap-3">
                <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', kindColor[n.kind])} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', !n.read && 'font-medium')}>{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(n.created).toLocaleString()}</p>
                </div>
                {!n.read && <div className="h-2 w-2 rounded-full bg-green-600 flex-shrink-0 mt-2" />}
              </CardContent>
            </Card>
          );
        })}
        {notifs.length === 0 && <div className="text-center py-12 text-muted-foreground"><Bell className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>No notifications yet</p></div>}
      </div>
    </div>
  );
}