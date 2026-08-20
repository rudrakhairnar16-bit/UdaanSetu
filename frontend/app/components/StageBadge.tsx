'use client';

import React from 'react';

interface StageBadgeProps {
  stage: string;
  kind?: string;
}

const STAGE_STYLES: Record<string, { bg: string; color: string }> = {
  'draft': { bg: 'var(--gray-100)', color: 'var(--gray-600)' },
  'available': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'open': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'submitted': { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  'under review': { bg: 'var(--yellow-100)', color: 'var(--yellow-800)' },
  'in progress': { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  'pending': { bg: 'var(--yellow-100)', color: 'var(--yellow-800)' },
  'screening': { bg: 'var(--orange-100)', color: 'var(--orange-800)' },
  'filed': { bg: 'var(--yellow-50)', color: 'var(--yellow-800)' },
  'examination': { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  'granted': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'approved': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'rejected': { bg: 'var(--red-100)', color: 'var(--red-700)' },
  'closed': { bg: 'var(--gray-100)', color: 'var(--gray-600)' },
  'done': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'complete': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'completed': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'stalled': { bg: 'var(--red-100)', color: 'var(--red-700)' },
  'at risk': { bg: 'var(--red-100)', color: 'var(--red-700)' },
  'pre-seed': { bg: 'var(--orange-100)', color: 'var(--orange-800)' },
  'seed': { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  'series a': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'growth': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'established': { bg: 'var(--green-100)', color: 'var(--green-800)' },
  'idea': { bg: 'var(--gray-100)', color: 'var(--gray-600)' },
  'prototype': { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  'concept': { bg: 'var(--gray-100)', color: 'var(--gray-600)' },
  'lab testing': { bg: 'var(--yellow-100)', color: 'var(--yellow-800)' },
  'field trial': { bg: 'var(--blue-100)', color: 'var(--blue-700)' },
  'validation': { bg: 'var(--yellow-50)', color: 'var(--yellow-800)' },
  'ipr screening': { bg: 'var(--orange-100)', color: 'var(--orange-800)' },
  'ready for market': { bg: 'var(--green-100)', color: 'var(--green-800)' },
};

export function StageBadge({ stage }: StageBadgeProps) {
  const s = stage.toLowerCase();
  const style = STAGE_STYLES[s] || { bg: 'var(--gray-100)', color: 'var(--gray-600)' };
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
