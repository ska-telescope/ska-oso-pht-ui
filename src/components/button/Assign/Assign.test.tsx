import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AssignButton from './Assign';

describe('Overview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<AssignButton action={mockAction} />);
    expect(screen.getByTestId('assignButtonTestId')).toHaveTextContent('assignBtn.label');
    screen.getByTestId('assignButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<AssignButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('assignButtonTestId')).toHaveTextContent('assignBtn.label');
  });
});
