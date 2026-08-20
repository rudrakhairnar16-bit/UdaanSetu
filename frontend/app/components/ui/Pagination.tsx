'use client';

import React from 'react';

interface PaginationProps {
  current: number;
  total: number;
  onChange: (page: number) => void;
  size?: 'sm' | 'md';
}

function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

export function Pagination({ current, total, onChange, size = 'md' }: PaginationProps) {
  if (total <= 1) return null;

  const btnStyle = (active: boolean): React.CSSProperties => ({
    minWidth: size === 'sm' ? 28 : 36,
    minHeight: size === 'sm' ? 28 : 36,
    padding: size === 'sm' ? '2px 8px' : '4px 12px',
    borderRadius: 8,
    fontSize: size === 'sm' ? 12 : 14,
    fontWeight: 600,
    border: '1px solid var(--gray-200)',
    background: active ? 'var(--green-600)' : 'white',
    color: active ? 'white' : 'var(--gray-700)',
    cursor: 'pointer',
    transition: 'all .15s',
  });

  return (
    <nav aria-label="Pagination" style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
      <button
        aria-label="Previous page"
        disabled={current <= 1}
        onClick={() => onChange(current - 1)}
        style={{ ...btnStyle(false), opacity: current <= 1 ? 0.4 : 1, minWidth: 44 }}
      >
        ◄
      </button>
      {pageWindow(current, total).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} aria-hidden="true" style={{ color: 'var(--gray-400)', padding: '0 2px' }}>…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-current={p === current ? 'page' : undefined}
            aria-label={`Page ${p}`}
            style={btnStyle(p === current)}
          >
            {p}
          </button>
        )
      )}
      <button
        aria-label="Next page"
        disabled={current >= total}
        onClick={() => onChange(current + 1)}
        style={{ ...btnStyle(false), opacity: current >= total ? 0.4 : 1, minWidth: 44 }}
      >
        ►
      </button>
    </nav>
  );
}