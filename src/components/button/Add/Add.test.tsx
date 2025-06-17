import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AddButton from './Add';
import '@testing-library/jest-dom';

describe('Add Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<AddButton action={mockAction} />);
    expect(screen.getByTestId('addButtonTestId')).toHaveTextContent('addBtn.label');
    screen.getByTestId('addButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<AddButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('addButtonTestId')).toHaveTextContent('addBtn.label');
  });
});
