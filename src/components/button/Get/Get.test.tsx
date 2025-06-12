import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import GetButton from './Get';
import '@testing-library/jest-dom';

describe('Get Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<GetButton action={mockAction} />);
    expect(screen.getByTestId('getButtonTestId')).toHaveTextContent('getBtn.label');
    screen.getByTestId('getButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<GetButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('getButtonTestId')).toHaveTextContent('getBtn.label');
  });
});
