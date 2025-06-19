import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BackButton from './Back';
import '@testing-library/jest-dom';

describe('Overview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<BackButton action={mockAction} />);
    expect(screen.getByTestId('backButtonTestId')).toHaveTextContent('backBtn.label');
    screen.getByTestId('backButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<BackButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('backButtonTestId')).toHaveTextContent('backBtn.label');
  });
});
