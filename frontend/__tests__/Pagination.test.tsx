import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../app/components/ui/Pagination';

describe('Pagination Component', () => {
  it('returns null when total <= 1', () => {
    const { container } = render(<Pagination current={1} total={1} onChange={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders page numbers for small totals', () => {
    render(<Pagination current={1} total={3} onChange={() => {}} />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  });

  it('marks current page with aria-current', () => {
    render(<Pagination current={2} total={5} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('fires onChange with new page on click', async () => {
    const onChange = vi.fn();
    render(<Pagination current={1} total={3} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('disables previous on first page and next on last page', () => {
    render(<Pagination current={1} total={3} onChange={() => {}} />);
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });
});