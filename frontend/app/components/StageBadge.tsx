'use client';

import React from 'react';

interface StageBadgeProps {
  stage: string;
  kind?: string;
}

const STAGE_STYLES: Record<string, { bg: string; color: string }> = {
  'draft': { bg: '#f3f4f6', color: '#6b7280' },
  'available': { bg: '#dcfce7', color: '#166534' },
  'open': { bg: '#dcfce7', color: '#166534' },
  'submitted': { bg: '#dbeafe', color: '#1e40af' },
  'under review': { bg: '#fef9c3', color: '#854d0e' },
  'in progress': { bg: '#dbeafe', color: '#1e40af' },
  'pending': { bg: '#fef9c3', color: '#854d0e' },
  'screening': { bg: '#fff7ed', color: '#9a3412' },
  'filed': { bg: '#fefce8', color: '#854d0e' },
  'examination': { bg: '#dbeafe', color: '#1e40af' },
  'granted': { bg: '#dcfce7', color: '#166534' },
  'approved': { bg: '#dcfce7', color: '#166534' },
  'rejected': { bg: '#fef2f2', color: '#991b1b' },
  'closed': { bg: '#f3f4f6', color: '#6b7280' },
  'done': { bg: '#dcfce7', color: '#166534' },
  'complete': { bg: '#dcfce7', color: '#166534' },
  'completed': { bg: '#dcfce7', color: '#166534' },
  'stalled': { bg: '#fef2f2', color: '#991b1b' },
  'at risk': { bg: '#fef2f2', color: '#991b1b' },
  'pre-seed': { bg: '#fff7ed', color: '#9a3412' },
  'seed': { bg: '#dbeafe', color: '#1e40af' },
  'series a': { bg: '#dcfce7', color: '#166534' },
  'growth': { bg: '#dcfce7', color: '#166534' },
  'established': { bg: '#dcfce7', color: '#166534' },
  'idea': { bg: '#f3f4f6', color: '#6b7280' },
  'prototype': { bg: '#dbeafe', color: '#1e40af' },
  'concept': { bg: '#f3f4f6', color: '#6b7280' },
  'lab testing': { bg: '#fef9c3', color: '#854d0e' },
  'field trial': { bg: '#dbeafe', color: '#1e40af' },
  'validation': { bg: '#fefce8', color: '#854d0e' },
  'ipr screening': { bg: '#fff7ed', color: '#9a3412' },
  'ready for market': { bg: '#dcfce7', color: '#166534' },
};

export function StageBadge({ stage }: StageBadgeProps) {
  const s = stage.toLowerCase();
  const style = STAGE_STYLES[s] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
      borderRadius: 9999, fontSize: 12, fontWeight: 600,
      background: style.bg, color: style.color,
    }}>
      {stage}
    </span>
  );
}
