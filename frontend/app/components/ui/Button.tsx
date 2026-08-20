'use client';

import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classes = [
    'btn',
    variant === 'primary' ? 'btn-primary' : '',
    variant === 'secondary' ? 'btn-secondary' : '',
    variant === 'danger' ? 'btn-danger' : '',
    variant === 'ghost' ? 'btn-ghost' : '',
    size === 'sm' ? 'btn-sm' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <span aria-hidden="true" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.35)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && <span aria-hidden="true">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}