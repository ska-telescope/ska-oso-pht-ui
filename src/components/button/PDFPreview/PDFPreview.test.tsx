import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PDFPreviewButton from './PDFPreview';
import '@testing-library/jest-dom';

describe('PDFPreview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PDFPreviewButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('pdfPreviewButtonTestId')).toHaveTextContent('pdfPreview.label');
    screen.getByTestId('pdfPreviewButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <PDFPreviewButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('pdfPreviewButtonTestId')).toHaveTextContent('pdfPreview.label');
  });
});
