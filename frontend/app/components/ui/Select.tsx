'use client';

import React from 'react';

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, id, required, className = '', ...props }: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error ? `${selectId}-error` : undefined;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={selectId}>
          {label}
          {required && <span style={{ color: 'var(--red-500)' }}> *</span>}
        </label>
      )}
      <select
        id={selectId}
        className={className}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && (
        <div id={errorId} role="alert" style={{ fontSize: 12, color: 'var(--red-500)', fontWeight: 500, marginTop: 4 }}>
          ✗ {error}
        </div>
      )}
    </div>
  );
}