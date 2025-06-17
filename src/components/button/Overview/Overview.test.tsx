import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OverviewButton from './Overview';
import '@testing-library/jest-dom';

describe('Overview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<OverviewButton action={mockAction} />);
    expect(screen.getByTestId('overviewButtonTestId')).toHaveTextContent('overviewBtn.label');
    screen.getByTestId('overviewButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<OverviewButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('overviewButtonTestId')).toHaveTextContent('overviewBtn.label');
  });
});
