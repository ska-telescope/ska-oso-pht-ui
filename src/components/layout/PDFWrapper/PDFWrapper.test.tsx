import { describe, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PDFWrapper from './PDFWrapper';

describe('<PDFWrapper />', () => {
  test('renders correctly, closed', () => {
    const mockActionClose = vi.fn();
    render(
      <StoreProvider>
        <PDFWrapper open={false} onClose={mockActionClose} url={'dummy file'} />
      </StoreProvider>
    );
  });
  test('renders correctly, open, calls onClose when dialog is closed', () => {
    const mockActionClose = vi.fn();
    render(
      <StoreProvider>
        <PDFWrapper open={true} onClose={mockActionClose} url={'dummy file'} />
      </StoreProvider>
    );
    screen.queryByTestId('cancelButtonTestId')?.click();
  });
});
