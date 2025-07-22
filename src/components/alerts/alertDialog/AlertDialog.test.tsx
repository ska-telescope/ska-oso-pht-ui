import { describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertDialog from './AlertDialog';
import '../../../services/i18n/i18n';

describe('<AlertDialog />', () => {
  const mockActionCancel = vi.fn();
  const mockActionClose = vi.fn();
  test('renders correctly, click cancel', () => {
    render(
      <AlertDialog open={true} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
    );
    const btn = screen.getAllByTestId('dialogCancelButton');
    btn[0].click();
  });
  test('renders correctly, click confirm', () => {
    render(
      <AlertDialog open={true} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
    );
    const btn = screen.getAllByTestId('dialogConfirmationButton');
    btn[0].click();
  });
});
