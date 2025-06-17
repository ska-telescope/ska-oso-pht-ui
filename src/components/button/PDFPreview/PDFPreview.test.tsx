import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PDFPreviewButton from './PDFPreview';
import '@testing-library/jest-dom';

describe('PDFPreview Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<PDFPreviewButton action={mockAction} />);
    expect(screen.getByTestId('pdfPreviewButtonTestId')).toHaveTextContent('pdfPreview.label');
    screen.getByTestId('pdfPreviewButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<PDFPreviewButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('pdfPreviewButtonTestId')).toHaveTextContent('pdfPreview.label');
  });
});
