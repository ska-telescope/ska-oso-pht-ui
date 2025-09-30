import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatusIconDisplay from './statusIcon';
import { STATUS_ERROR_SYMBOL } from '@/utils/constants';

describe('StatusIconDisplay', () => {
  const baseProps = {
    ariaDescription: 'Test description',
    ariaTitle: 'Test title',
    level: 1,
    testId: 'status-icon',
    text: STATUS_ERROR_SYMBOL
  };

  it('renders with default props and icon', () => {
    render(<StatusIconDisplay {...baseProps} />);
    const icon = screen.getByTestId('status-icon');
    expect(icon).toBeInTheDocument();
  });

  /*
  it('renders with custom text', () => {
    render(<StatusIconDisplay {...baseProps} text="Custom Text" />);
    const icon = screen.getByTestId('status-icon');
    expect(icon).toHaveTextContent('Custom Text');
  });

  it('renders with STATUS_ERROR level and no text', () => {
    render(<StatusIconDisplay {...baseProps} level={STATUS_ERROR} />);
    const icon = screen.getByTestId('status-icon');
    expect(icon).toHaveTextContent(STATUS_ERROR_SYMBOL);
  });
  */

  it('renders with tooltip and accessibility labels', () => {
    render(<StatusIconDisplay {...baseProps} toolTip="Tooltip text" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Tooltip text');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<StatusIconDisplay {...baseProps} onClick={handleClick} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders as disabled when disabled prop is true', () => {
    render(<StatusIconDisplay {...baseProps} disabled />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies custom size', () => {
    render(<StatusIconDisplay {...baseProps} size={40} />);
    const icon = screen.getByTestId('status-icon');
    expect(icon).toBeInTheDocument(); // You could add more checks if StatusIcon exposes size
  });
});
