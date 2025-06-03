import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ValidateButton from './Validate';
import '@testing-library/jest-dom';

describe('Validate Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<ValidateButton action={mockAction} />);
    expect(screen.getByTestId('validationBtnTestId')).toHaveTextContent('validateBtn.label');
    screen.getByTestId('validationBtnTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<ValidateButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('validationBtnTestId')).toHaveTextContent('validateBtn.label');
  });
});
