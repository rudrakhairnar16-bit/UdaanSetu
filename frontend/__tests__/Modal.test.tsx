import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from '../app/components/Modal';

describe('Modal Component', () => {
  it('renders title and children', () => {
    render(
      <Modal title="Create Project" onClose={() => {}}>
        <p>Form content</p>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
    expect(screen.getByText('Form content')).toBeInTheDocument();
  });

  it('has accessible dialog attributes', () => {
    render(<Modal title="Delete" onClose={() => {}}><p>Content</p></Modal>);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('closes when Escape is pressed', async () => {
    const onClose = vi.fn();
    render(<Modal title="Modal" onClose={onClose}><p>Content</p></Modal>);
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes when close button is clicked', async () => {
    const onClose = vi.fn();
    render(<Modal title="Modal" onClose={onClose}><p>Content</p></Modal>);
    await userEvent.click(screen.getByLabelText('Close dialog'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});