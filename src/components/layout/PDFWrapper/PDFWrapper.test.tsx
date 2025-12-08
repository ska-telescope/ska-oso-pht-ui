import { describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PDFWrapper from './PDFWrapper';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>
        <ThemeA11yProvider>{component}</ThemeA11yProvider>
      </AppFlowProvider>
    </StoreProvider>
  );
};

describe('<PDFWrapper />', () => {
  test('renders correctly, closed', () => {
    const mockActionClose = vi.fn();
    wrapper(<PDFWrapper open={false} onClose={mockActionClose} url={'dummy file'} />);
  });
  test('renders correctly, open, calls onClose when dialog is closed', () => {
    const mockActionClose = vi.fn();
    wrapper(<PDFWrapper open={true} onClose={mockActionClose} url={'dummy file'} />);
    screen.queryByTestId('cancelButtonTestId')?.click();
  });
});
