'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padded?: boolean;
}

export function Card({ hoverable = false, padded = true, className = '', style, children, ...props }: CardProps) {
  const classes = ['card', hoverable ? 'hoverable' : '', className].filter(Boolean).join(' ');
  return (
    <div className={classes} style={{ ...(padded ? {} : { padding: 0 }), ...style }} {...props}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function CardHeader({ title, action, children }: CardHeaderProps) {
  return (
    <div className="card-header">
      {children ?? <h3>{title}</h3>}
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
}

export function CardFooter({ children }: CardFooterProps) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--gray-100)' }}>
      {children}
    </div>
  );
}