import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ResetButton from './Reset';
import '@testing-library/jest-dom';

describe('Reset Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ResetButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('resetButtonTestId')).toHaveTextContent('reset.label');
    screen.getByTestId('resetButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <ResetButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('resetButtonTestId')).toHaveTextContent('reset.label');
  });
});
