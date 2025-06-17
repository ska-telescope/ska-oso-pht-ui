import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResolveButton from './Resolve';
import '@testing-library/jest-dom';

describe('Resolve Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<ResolveButton action={mockAction} />);
    expect(screen.getByTestId('resolveButtonTestId')).toHaveTextContent('resolve.label');
    screen.getByTestId('resolveButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<ResolveButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('resolveButtonTestId')).toHaveTextContent('resolve.label');
  });
});
