import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ConflictButton from './Conflict';
import '@testing-library/jest-dom';

describe('Conflict Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<ConflictButton action={mockAction} />);
    expect(screen.getByTestId('conflictBtnTestId')).toHaveTextContent('conflictBtn.label');
    screen.getByTestId('conflictBtnTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<ConflictButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('conflictBtnTestId')).toHaveTextContent('conflictBtn.label');
  });
});
