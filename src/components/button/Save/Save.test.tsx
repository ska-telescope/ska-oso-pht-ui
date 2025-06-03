import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SaveButton from './Save';
import '@testing-library/jest-dom';

describe('Save Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<SaveButton action={mockAction} />);
    expect(screen.getByTestId('saveButtonTestId')).toHaveTextContent('saveBtn.label');
    screen.getByTestId('saveButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<SaveButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('saveButtonTestId')).toHaveTextContent('saveBtn.label');
  });
});
