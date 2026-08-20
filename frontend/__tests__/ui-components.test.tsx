import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Badge } from '../app/components/ui/Badge';
import { Breadcrumb } from '../app/components/ui/Breadcrumb';
import { Input } from '../app/components/ui/Input';

describe('Badge Component', () => {
  it('renders children with default variant', () => {
    render(<Badge>Draft</Badge>);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('renders removable badge and fires onRemove', async () => {
    const onRemove = vi.fn();
    const userEvent = (await import('@testing-library/user-event')).default;
    render(<Badge removable onRemove={onRemove}>Draft</Badge>);
    await userEvent.click(screen.getByLabelText('Remove filter'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe('Breadcrumb Component', () => {
  it('renders items and marks last as current', () => {
    render(
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Research', active: true },
      ]} />
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Research')).toHaveAttribute('aria-current', 'page');
  });
});

describe('Input Component', () => {
  it('renders label and marks required', () => {
    render(<Input label="Title" required />);
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByLabelText(/Title/)).toBeInTheDocument();
  });

  it('renders error message and aria-invalid', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByText('✗ Invalid email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true');
  });
});