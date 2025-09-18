import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SaveButton from './Save';
import '@testing-library/jest-dom';

describe('Save Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <SaveButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('saveButtonTestId')).toHaveTextContent('saveBtn.label');
    screen.getByTestId('saveButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <SaveButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('saveButtonTestId')).toHaveTextContent('saveBtn.label');
  });
});
