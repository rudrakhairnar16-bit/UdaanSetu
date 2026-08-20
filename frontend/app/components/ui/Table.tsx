'use client';

import React from 'react';

interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  striped?: boolean;
  hoverable?: boolean;
  emptyMessage?: string;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  striped = false,
  hoverable = true,
  emptyMessage = 'No records found',
  sortKey,
  sortDir,
  onSort,
}: TableProps<T>) {
  if (data.length === 0) {
    return <div className="empty"><p>{emptyMessage}</p></div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                style={{ width: col.width, cursor: col.sortable ? 'pointer' : 'default', userSelect: 'none' }}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                aria-sort={col.sortable && sortKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}
              >
                {col.label}
                {col.sortable && sortKey === col.key && <span aria-hidden="true"> {sortDir === 'asc' ? '▲' : '▼'}</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={String(row[keyField])}
              style={striped && idx % 2 === 1 ? { background: 'var(--gray-50)' } : undefined}
            >
              {columns.map(col => (
                <td key={col.key}>{col.render ? col.render(row) : String(row[col.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}