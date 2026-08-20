'use client';

import React from 'react';

export type BadgeVariant = 'primary' | 'secondary' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  icon?: React.ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

const STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  primary: { bg: 'var(--green-100)', color: 'var(--green-800)' },
  secondary: { bg: 'var(--gray-100)', color: 'var(--gray-600)' },
  warning: { bg: 'var(--yellow-100)', color: 'var(--yellow-800)' },
  danger: { bg: 'var(--red-100)', color: 'var(--red-700)' },
  info: { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
};

export function Badge({ variant = 'secondary', children, icon, removable = false, onRemove }: BadgeProps) {
  const style = STYLES[variant];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px',
      borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 600,
      background: style.bg, color: style.color, whiteSpace: 'nowrap',
    }}>
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          aria-label="Remove filter"
          style={{ background: 'none', border: 'none', padding: 0, marginLeft: 2, fontSize: 13, lineHeight: 1, color: 'inherit', opacity: 0.7, cursor: 'pointer' }}
        >
          ✕
        </button>
      )}
    </span>
  );
}