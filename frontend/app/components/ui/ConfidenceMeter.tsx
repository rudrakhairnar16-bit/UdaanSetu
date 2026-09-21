'use client';

import React from 'react';

export interface ConfidenceMeterProps {
  value: number; // 0 to 100
  label?: string;
  ciLower?: number;
  ciUpper?: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  color?: string;
  style?: React.CSSProperties;
}

export function ConfidenceMeter({
  value,
  label = 'Model Confidence',
  ciLower,
  ciUpper,
  size = 'md',
  showPercentage = true,
  color,
  style,
}: ConfidenceMeterProps) {
  const clamped = Math.max(0, Math.min(100, value));

  const getColor = (val: number) => {
    if (color) return color;
    if (val >= 80) return '#16a34a';
    if (val >= 50) return '#0284c7';
    if (val >= 30) return '#d97706';
    return '#dc2626';
  };

  const meterColor = getColor(clamped);
  const height = size === 'sm' ? 6 : size === 'lg' ? 12 : 8;

  return (
    <div style={{ width: '100%', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {label}
        </span>
        {showPercentage && (
          <span style={{ fontSize: 13, fontWeight: 800, color: meterColor }}>
            {clamped}%
          </span>
        )}
      </div>

      <div style={{
        width: '100%',
        height,
        background: 'var(--surface-soft)',
        borderRadius: height / 2,
        overflow: 'hidden',
        border: '1px solid var(--border-soft)',
        position: 'relative',
      }}>
        <div style={{
          width: `${clamped}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${meterColor}99, ${meterColor})`,
          borderRadius: height / 2,
          transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }} />
      </div>

      {ciLower !== undefined && ciUpper !== undefined && (
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>
          95% Confidence Interval: [{ciLower}% &mdash; {ciUpper}%]
        </div>
      )}
    </div>
  );
}
