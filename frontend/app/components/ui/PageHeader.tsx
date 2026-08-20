'use client';

import React from 'react';
import { Breadcrumb } from './Breadcrumb';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  crumb?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, crumb, action }: PageHeaderProps) {
  return (
    <div className="page-header">
      {crumb && <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: crumb, active: true }]} />}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="subtitle" style={{ margin: 0 }}>{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}