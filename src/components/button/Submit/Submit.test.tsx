import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubmitButton from './Submit';
import '@testing-library/jest-dom';

describe('Submit Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<SubmitButton action={mockAction} />);
    expect(screen.getByTestId('submitBtnTestId')).toHaveTextContent('submitBtn.label');
    screen.getByTestId('submitBtnTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<SubmitButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('submitBtnTestId')).toHaveTextContent('submitBtn.label');
  });
});
