'use client';

import React from 'react';
import { Icon } from './Icon';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export function EmptyState({
  title,
  description,
  icon = 'search',
  actionText,
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <div
      style={{
        padding: '56px 24px',
        textAlign: 'center',
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 14,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
    >
      <div style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        background: 'var(--surface-soft)',
        border: '1px solid var(--border-soft)',
        color: 'var(--text-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
      }}>
        <Icon name={icon} size={24} />
      </div>

      <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
        {title}
      </h3>

      {description && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 420, margin: '0 0 18px', lineHeight: 1.5 }}>
          {description}
        </p>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: '9px 18px',
            borderRadius: 8,
            background: 'linear-gradient(135deg, #012348, #013158)',
            color: '#ffffff',
            fontSize: 13,
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
