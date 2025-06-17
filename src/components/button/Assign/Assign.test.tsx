import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AssignButton from './Assign';
import '@testing-library/jest-dom';

describe('Get Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<AssignButton action={mockAction} />);
    expect(screen.getByTestId('assigntButtonTestId')).toHaveTextContent('assigntBtn.label');
    screen.getByTestId('assigntButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<AssignButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('assigntButtonTestId')).toHaveTextContent('assigntBtn.label');
  });
});
