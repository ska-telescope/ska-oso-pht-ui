import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResetButton from './Reset';
import '@testing-library/jest-dom';

describe('Reset Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<ResetButton action={mockAction} />);
    expect(screen.getByTestId('resetButtonTestId')).toHaveTextContent('reset.label');
    screen.getByTestId('resetButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<ResetButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('resetButtonTestId')).toHaveTextContent('reset.label');
  });
});
