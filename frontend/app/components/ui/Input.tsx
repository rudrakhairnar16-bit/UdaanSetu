'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, required, className = '', ...props }: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId}>
          {label}
          {required && <span style={{ color: 'var(--red-500)' }}> *</span>}
        </label>
      )}
      <input
        id={inputId}
        className={className}
        aria-invalid={!!error}
        aria-describedby={errorId || (hint ? `${inputId}-hint` : undefined)}
        {...props}
      />
      {error && (
        <div id={errorId} role="alert" style={{ fontSize: 12, color: 'var(--red-500)', fontWeight: 500, marginTop: 4 }}>
          ✗ {error}
        </div>
      )}
      {hint && !error && (
        <div id={`${inputId}-hint`} style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}