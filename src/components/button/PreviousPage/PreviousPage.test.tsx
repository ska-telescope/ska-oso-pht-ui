import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PreviousPageButton from './PreviousPage';
import '@testing-library/jest-dom';

describe('PreviousPage Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<PreviousPageButton action={mockAction} />);
    expect(screen.getByTestId('previousPageButtonTestId')).toHaveTextContent('baseBtn.label');
    screen.getByTestId('previousPageButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<PreviousPageButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('previousPageButtonTestId')).toHaveTextContent('baseBtn.label');
  });
});
