import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SubmitButton from './Submit';
import '@testing-library/jest-dom';

describe('Submit Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SubmitButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('submitBtnTestId')).toHaveTextContent('submitBtn.label');
    screen.getByTestId('submitBtnTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <SubmitButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('submitBtnTestId')).toHaveTextContent('submitBtn.label');
  });
});
