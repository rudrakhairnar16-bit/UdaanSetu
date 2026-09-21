'use client';

import React from 'react';
import { Icon } from './Icon';

export interface AIInsightCardProps {
  title: string;
  category?: string;
  confidence?: number;
  recommendation?: string;
  reasons?: string[];
  score?: number;
  riskLevel?: 'Low' | 'Medium' | 'High' | string;
  actionText?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export function AIInsightCard({
  title,
  category = 'AI Analysis',
  confidence,
  recommendation,
  reasons = [],
  score,
  riskLevel,
  actionText,
  onAction,
  style,
  className = '',
}: AIInsightCardProps) {
  const getRiskColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return { text: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
      case 'medium': return { text: '#d97706', bg: '#fffbeb', border: '#fde68a' };
      case 'low': return { text: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
      default: return { text: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' };
    }
  };

  const riskPalette = riskLevel ? getRiskColor(riskLevel) : null;

  return (
    <div
      className={`card ${className}`}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 14,
        padding: 20,
        position: 'relative',
        boxShadow: 'var(--shadow-xs)',
        ...style,
      }}
    >
      {/* Top AI badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 9px',
            borderRadius: 12,
            background: 'rgba(212,136,15,.12)',
            border: '1px solid rgba(212,136,15,.3)',
            fontSize: 11,
            fontWeight: 700,
            color: 'var(--green-700, #b37209)',
          }}>
            <Icon name="sparkles" size={12} />
            {category}
          </span>

          {confidence !== undefined && (
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>
              {confidence}% Confidence
            </span>
          )}
        </div>

        {riskLevel && riskPalette && (
          <span style={{
            padding: '3px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            background: riskPalette.bg,
            color: riskPalette.text,
            border: `1px solid ${riskPalette.border}`,
          }}>
            {riskLevel} Risk {score !== undefined ? `(${score}/100)` : ''}
          </span>
        )}
      </div>

      {/* Main Title */}
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
        {title}
      </div>

      {/* Recommendation description */}
      {recommendation && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px' }}>
          {recommendation}
        </p>
      )}

      {/* Reasons pills */}
      {reasons.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {reasons.map((r, i) => (
            <span
              key={i}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: '3px 8px',
                borderRadius: 6,
                background: 'var(--surface-soft)',
                border: '1px solid var(--border-soft)',
                color: 'var(--text-secondary)',
              }}
            >
              &bull; {r}
            </span>
          ))}
        </div>
      )}

      {/* Action button */}
      {actionText && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid var(--border-soft)' }}>
          <button
            onClick={onAction}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              background: 'var(--surface-soft)',
              border: '1px solid var(--border-soft)',
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {actionText} &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
