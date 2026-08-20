'use client';

import React from 'react';

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      {items.map((item, i) => {
        const last = i === items.length - 1 || item.active;
        return (
          <React.Fragment key={i}>
            {last ? (
              <span aria-current="page" style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{item.label}</span>
            ) : (
              <a href={item.href} style={{ color: 'var(--green-700)', textDecoration: 'none' }}>{item.label}</a>
            )}
            {i < items.length - 1 && <span aria-hidden="true">›</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}