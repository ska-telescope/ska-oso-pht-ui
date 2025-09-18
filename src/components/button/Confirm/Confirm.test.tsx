import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ConfirmButton from './Confirm';
import '@testing-library/jest-dom';

describe('Confirm Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ConfirmButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('confirmButtonTestId')).toHaveTextContent('confirmBtn.label');
    screen.getByTestId('confirmButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <ConfirmButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('confirmButtonTestId')).toHaveTextContent('confirmBtn.label');
  });
});
