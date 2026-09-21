'use client';

import React from 'react';
import { Icon } from './Icon';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  color?: string;
  accentBg?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function StatCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  color = '#012348',
  accentBg = false,
  onClick,
  className = '',
  style,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={`stat-card ${onClick ? 'hoverable' : ''} ${className}`}
      style={{
        background: accentBg ? `linear-gradient(135deg, ${color}, #011a38)` : 'var(--surface)',
        border: accentBg ? 'none' : '1px solid var(--border-soft)',
        color: accentBg ? '#ffffff' : 'inherit',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: 14,
        padding: '18px 20px',
        boxShadow: 'var(--shadow-xs)',
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          color: accentBg ? '#92eaFF' : 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '.07em',
        }}>
          {label}
        </span>

        {icon && (
          <span style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: accentBg ? 'rgba(255,255,255,.12)' : `${color}14`,
            color: accentBg ? '#ffffff' : color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Icon name={icon} size={17} />
          </span>
        )}
      </div>

      <div style={{
        fontSize: 28,
        fontWeight: 800,
        color: accentBg ? '#ffffff' : color,
        fontFamily: 'var(--font-display)',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
      }}>
        {value}
      </div>

      {(subtitle || trend) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginTop: 8,
          fontSize: 12,
          color: accentBg ? '#c8f3ff' : 'var(--text-tertiary)',
        }}>
          {trend && (
            <span style={{
              fontWeight: 700,
              color: trend.isPositive ? '#16a34a' : '#dc2626',
            }}>
              {trend.value}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
