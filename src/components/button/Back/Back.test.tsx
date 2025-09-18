import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import BackButton from './Back';
import '@testing-library/jest-dom';

describe('Overview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <BackButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('backButtonTestId')).toHaveTextContent('backBtn.label');
    screen.getByTestId('backButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <BackButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('backButtonTestId')).toHaveTextContent('backBtn.label');
  });
});
