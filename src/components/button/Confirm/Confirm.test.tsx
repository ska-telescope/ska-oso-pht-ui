import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConfirmButton from './Confirm';
import '@testing-library/jest-dom';

describe('Confirm Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<ConfirmButton action={mockAction} />);
    expect(screen.getByTestId('confirmButtonTestId')).toHaveTextContent('confirmBtn.label');
    screen.getByTestId('confirmButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<ConfirmButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('confirmButtonTestId')).toHaveTextContent('confirmBtn.label');
  });
});
