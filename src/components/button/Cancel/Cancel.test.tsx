import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CancelButton from './Cancel';
import '@testing-library/jest-dom';

describe('Cancel Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<CancelButton action={mockAction} />);
    expect(screen.getByTestId('cancelButtonTestId')).toHaveTextContent('cancelBtn.label');
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<CancelButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('cancelButtonTestId')).toHaveTextContent('cancelBtn.label');
  });
});
