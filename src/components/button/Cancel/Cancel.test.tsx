import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import CancelButton from './Cancel';
import '@testing-library/jest-dom';

describe('Cancel Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <CancelButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('cancelButtonTestId')).toHaveTextContent('cancelBtn.label');
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <CancelButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('cancelButtonTestId')).toHaveTextContent('cancelBtn.label');
  });
});
