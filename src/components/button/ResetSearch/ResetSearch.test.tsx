import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResetSearchButton from './ResetSearch';
import '@testing-library/jest-dom';

describe('<ResetSearchButton />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<ResetSearchButton action={mockAction} />);
    expect(screen.getByTestId('resetSearchButtonTestId')).toHaveTextContent('emailSearch.reset');
    screen.getByTestId('resetSearchButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<ResetSearchButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('resetSearchButtonTestId')).toHaveTextContent('emailSearch.reset');
  });
});
