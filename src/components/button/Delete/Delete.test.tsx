import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DeleteButton from './Delete';
import '@testing-library/jest-dom';

describe('Delete Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<DeleteButton action={mockAction} />);
    expect(screen.getByTestId('deleteButtonTestId')).toHaveTextContent('deleteBtn.label');
    screen.getByTestId('deleteButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<DeleteButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('deleteButtonTestId')).toHaveTextContent('deleteBtn.label');
  });
});
