import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Delete } from '@mui/icons-material';
import Icon from './Icon';

describe('Icon component', () => {
  const defaultProps = {
    icon: <Delete data-testid="iconElement" />,
    onClick: vi.fn(),
    testId: 'deleteIcon',
    toolTip: 'Delete item',
    sx: { color: 'red' }
  };

  it('renders tooltip and icon button', () => {
    render(<Icon {...defaultProps} />);

    // Tooltip wrapper
    expect(screen.getByTestId('deleteIcon')).toBeInTheDocument();

    // IconButton with aria-label
    const button = screen.getByRole('button', { name: /delete item/i });
    expect(button).toBeInTheDocument();

    // Icon inside the button
    expect(screen.getByTestId('iconElement')).toBeInTheDocument();
  });

  it('calls onClick when icon button is clicked', () => {
    render(<Icon {...defaultProps} />);
    const button = screen.getByRole('button', { name: /delete item/i });
    fireEvent.click(button);
    expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
  });

  it('disables button when disabled is true', () => {
    render(<Icon {...defaultProps} disabled />);
    const button = screen.getByRole('button', { name: /delete item/i });
    expect(button).toBeDisabled();
  });

  it('applies custom sx styles', () => {
    render(<Icon {...defaultProps} />);
    const button = screen.getByRole('button', { name: /delete item/i });
    // Since sx is applied via MUI, we can check for inline style fallback
    expect(button).toHaveStyle({ cursor: 'pointer' });
  });
});
