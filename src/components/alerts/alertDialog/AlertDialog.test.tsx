import { describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import AlertDialog from './AlertDialog';
import '../../../services/i18n/i18n';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('<AlertDialog />', () => {
  const mockActionCancel = vi.fn();
  const mockActionClose = vi.fn();
  test('renders correctly, click cancel', () => {
    wrapper(
      <AlertDialog open={true} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
    );
    const btn = screen.getAllByTestId('dialogCancelButton');
    btn[0].click();
  });
  test('renders correctly, click confirm', () => {
    wrapper(
      <AlertDialog open={true} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
    );
    const btn = screen.getAllByTestId('dialogConfirmationButton');
    btn[0].click();
  });
});
