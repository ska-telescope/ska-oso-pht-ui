import { describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import AlertDialog from './AlertDialog';
import '../../../services/i18n/i18n';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
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
    const btn = screen.getAllByRole('button', { name: 'cancelBtn.label' });
    btn[0].click();
  });
  test('renders correctly, click confirm', () => {
    wrapper(
      <AlertDialog open={true} onClose={mockActionClose} onDialogResponse={mockActionCancel} />
    );
    const btn = screen.getAllByRole('button', { name: 'confirmBtn.label' });
    btn[0].click();
  });
});
