import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlertDialog from './AlertDialog';
import '../../../services/i18n/i18n';

describe('<AlertDialog />', () => {
  const mockActionCancel = vi.fn();
  const mockActionClose = vi.fn();
  test('renders correctly, click cancel', () => {
    render(
      <AlertDialog open={false} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
    );
    // const btn = screen.getAllByTestId('cancelButtonTestId');
    // btn[0].click();
  });
  test('renders correctly, click confirm', () => {
    render(
      <AlertDialog open={false} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
    );
    // const btn = screen.getAllByTestId('confirmButtonTestId');
    // btn[0].click();
  });
});
