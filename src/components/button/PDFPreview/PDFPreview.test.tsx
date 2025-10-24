import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PDFPreviewButton from './PDFPreview';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('PDFPreview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<PDFPreviewButton action={mockAction} />);
    expect(screen.getByTestId('pdfPreviewButtonTestId')).toHaveTextContent('pdfPreview.label');
    screen.getByTestId('pdfPreviewButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<PDFPreviewButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('pdfPreviewButtonTestId')).toHaveTextContent('pdfPreview.label');
  });
});
