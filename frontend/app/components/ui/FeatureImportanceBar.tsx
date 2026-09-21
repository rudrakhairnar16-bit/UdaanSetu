'use client';

import React from 'react';

export interface FeatureImportanceItem {
  feature: string;
  importance: number; // 0 to 100
  value?: string | number;
}

export interface FeatureImportanceBarProps {
  features: FeatureImportanceItem[];
  title?: string;
  maxItems?: number;
  style?: React.CSSProperties;
}

export function FeatureImportanceBar({
  features,
  title = 'Feature Importance (SHAP / GBDT)',
  maxItems = 6,
  style,
}: FeatureImportanceBarProps) {
  const sorted = [...features]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, maxItems);

  const maxImp = Math.max(...sorted.map(f => f.importance), 1);

  return (
    <div style={{ width: '100%', ...style }}>
      {title && (
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
          {title}
        </div>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {sorted.map(item => {
          const pct = Math.round((item.importance / maxImp) * 100);

          return (
            <div key={item.feature} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
              <span style={{
                width: 130,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'capitalize',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {item.feature.replace(/_/g, ' ')}
              </span>

              <div style={{
                flex: 1,
                height: 8,
                background: 'var(--surface-soft)',
                borderRadius: 4,
                overflow: 'hidden',
                border: '1px solid var(--border-soft)',
              }}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #0284c7, #012348)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }} />
              </div>

              <span style={{ width: 45, textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                {Math.round(item.importance)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
