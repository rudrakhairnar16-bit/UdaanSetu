'use client';

import React from 'react';
import { Icon } from './Icon';

export interface JourneyStageItem {
  stageNumber: number;
  title: string;
  tagline: string;
  status?: 'completed' | 'current' | 'upcoming' | 'blocked';
  timestamp?: string;
  actor?: string;
  details?: string;
}

export interface JourneyTimelineProps {
  stages: JourneyStageItem[];
  currentStageNumber?: number;
  orientation?: 'horizontal' | 'vertical';
  onSelectStage?: (stageNumber: number) => void;
  style?: React.CSSProperties;
}

export function JourneyTimeline({
  stages,
  currentStageNumber = 1,
  orientation = 'horizontal',
  onSelectStage,
  style,
}: JourneyTimelineProps) {
  if (orientation === 'horizontal') {
    return (
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 6, ...style }}>
        <div style={{ display: 'flex', gap: 6, minWidth: 700 }}>
          {stages.map((s) => {
            const isCompleted = s.stageNumber < currentStageNumber || s.status === 'completed';
            const isCurrent = s.stageNumber === currentStageNumber || s.status === 'current';

            const color = isCurrent ? 'var(--green-600, #d4880f)' : isCompleted ? '#16a34a' : 'var(--gray-400)';
            const bg = isCurrent ? 'var(--green-50, #fef7e8)' : isCompleted ? '#f0fdf4' : 'var(--surface-soft)';

            return (
              <div
                key={s.stageNumber}
                onClick={() => onSelectStage?.(s.stageNumber)}
                style={{
                  flex: 1,
                  background: bg,
                  border: `1px solid ${isCurrent ? 'var(--green-400)' : isCompleted ? '#bbf7d0' : 'var(--border-soft)'}`,
                  borderRadius: 10,
                  padding: '10px 12px',
                  cursor: onSelectStage ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--surface)',
                    border: `1px solid ${isCurrent ? 'var(--green-300)' : 'var(--border-soft)'}`,
                  }}>
                    #{s.stageNumber}
                  </span>
                  {isCompleted && (
                    <span style={{ color: '#16a34a' }}>
                      <Icon name="check" size={13} strokeWidth={2.5} />
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  {s.tagline}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Vertical Timeline
  return (
    <div style={{ display: 'grid', gap: 14, ...style }}>
      {stages.map((s, idx) => {
        const isCompleted = s.stageNumber < currentStageNumber || s.status === 'completed';
        const isCurrent = s.stageNumber === currentStageNumber || s.status === 'current';

        const color = isCurrent ? 'var(--green-600, #d4880f)' : isCompleted ? '#16a34a' : 'var(--gray-400)';

        return (
          <div
            key={s.stageNumber}
            onClick={() => onSelectStage?.(s.stageNumber)}
            style={{
              display: 'flex',
              gap: 14,
              cursor: onSelectStage ? 'pointer' : 'default',
              position: 'relative',
            }}
          >
            {/* Timeline line */}
            {idx < stages.length - 1 && (
              <div style={{
                position: 'absolute',
                left: 14,
                top: 30,
                bottom: -14,
                width: 2,
                background: isCompleted ? '#16a34a' : 'var(--gray-200)',
              }} />
            )}

            {/* Stage circle */}
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: isCurrent ? 'var(--green-600, #d4880f)' : isCompleted ? '#16a34a' : 'var(--surface-soft)',
              color: isCurrent || isCompleted ? '#ffffff' : 'var(--text-secondary)',
              border: `2px solid ${isCurrent ? 'var(--green-400)' : isCompleted ? '#16a34a' : 'var(--border-soft)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 800,
              zIndex: 1,
              flexShrink: 0,
            }}>
              {isCompleted ? <Icon name="check" size={14} /> : s.stageNumber}
            </div>

            {/* Details */}
            <div style={{ flex: 1, background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {s.title}
                </div>
                {s.timestamp && (
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.timestamp}</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                {s.tagline} {s.actor ? `&middot; ${s.actor}` : ''}
              </div>
              {s.details && (
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 6, lineHeight: 1.4 }}>
                  {s.details}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
