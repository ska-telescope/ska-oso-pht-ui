import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import ValidateButton from './Validate';
import '@testing-library/jest-dom';

describe('Validate Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ValidateButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('validationBtnTestId')).toHaveTextContent('validationBtn.label');
    screen.getByTestId('validationBtnTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <ValidateButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('validationBtnTestId')).toHaveTextContent('validationBtn.label');
  });
});
