import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PDFViewer from './PDFViewer';

describe('<PDFViewer />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PDFViewer onClose={vi.fn()} url={'dummyURL'} />
      </StoreProvider>
    );
  });
});
