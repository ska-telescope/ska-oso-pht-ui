import { describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PDFWrapper from './PDFWrapper';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
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
