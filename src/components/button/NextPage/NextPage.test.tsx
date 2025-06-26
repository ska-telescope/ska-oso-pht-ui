import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NextPageButton from './NextPage';
import '@testing-library/jest-dom';

describe('NextPage Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<NextPageButton action={mockAction} />);
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
    screen.getByTestId('nextPageButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<NextPageButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
  });
  test('renders correctly with page < 0', () => {
    render(<NextPageButton action={mockAction} page={-1} />);
    expect(screen.getByTestId('nextPageButtonTestId')).toHaveTextContent('addBtn.label');
  });
});
