import { describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import AlertDialog from './AlertDialog';
import '../../../services/i18n/i18n';

describe('<AlertDialog />', () => {
  const mockActionCancel = vi.fn();
  const mockActionClose = vi.fn();
  test('renders correctly, click cancel', () => {
    render(
      <StoreProvider>
        <AlertDialog open={true} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
      </StoreProvider>
    );
    const btn = screen.getAllByTestId('dialogCancelButton');
    btn[0].click();
  });
  test('renders correctly, click confirm', () => {
    render(
      <StoreProvider>
        <AlertDialog open={true} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
      </StoreProvider>
    );
    const btn = screen.getAllByTestId('dialogConfirmationButton');
    btn[0].click();
  });
});
