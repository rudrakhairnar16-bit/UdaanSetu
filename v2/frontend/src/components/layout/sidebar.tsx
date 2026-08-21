'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FlaskConical,
  Lightbulb,
  FileText,
  Rocket,
  Users,
  Building2,
  Landmark,
  BarChart3,
  Globe,
  Bell,
  User,
  ClipboardList,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/research', label: 'Research', icon: FlaskConical },
  { href: '/innovations', label: 'Innovations', icon: Lightbulb },
  { href: '/ipr', label: 'IPR / Patents', icon: FileText },
  { href: '/startups', label: 'Startups', icon: Rocket },
  { href: '/ecosystem/mentors', label: 'Mentors', icon: Users },
  { href: '/ecosystem/schemes', label: 'Schemes', icon: Landmark },
  { href: '/ecosystem/incubators', label: 'Incubators', icon: Building2 },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/govt', label: 'Govt APIs', icon: Globe },
  { href: '/notifications', label: 'Notifications', icon: Bell },
  { href: '/audit', label: 'Audit Log', icon: ClipboardList },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = {
    name: 'Demo Administrator',
    email: 'admin@udaansetu.demo',
    role: 'Admin',
    district: 'Ahmedabad',
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen bg-card border-r border-border transition-all duration-200 flex flex-col',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className={cn('flex h-16 items-center justify-between px-4 border-b', collapsed && 'justify-center')}>
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gujarat-600">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span className="font-bold text-lg text-gujarat-700">UdaanSetu</span>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn('h-8 w-8', collapsed && 'mx-auto')}
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gujarat-100 text-gujarat-700'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-gujarat-700')} aria-hidden="true" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={cn('p-4 border-t', collapsed && 'hidden')}>
          <Separator className="mb-4" />
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate capitalize">{user.role.toLowerCase()}</p>
              <p className="text-xs text-muted-foreground truncate">{user.district}</p>
            </div>
          </div>
        </div>

        {/* Collapsed user tooltip */}
        {collapsed && (
          <div className="absolute left-16 top-16 z-50 bg-popover border rounded-lg shadow-lg p-2 min-w-[200px]">
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
                <p className="text-xs text-muted-foreground">{user.district}</p>
              </div>
            </div>
            <Separator className="my-2" />
            <button className="flex w-full items-center gap-2 px-2 py-1 text-sm text-destructive hover:bg-accent rounded">
              Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed bottom-4 right-4 z-50 rounded-full bg-gujarat-600 p-3 shadow-lg text-white"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
    </>
  );
}