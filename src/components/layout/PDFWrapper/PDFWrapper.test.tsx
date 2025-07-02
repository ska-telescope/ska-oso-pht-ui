import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import dummyFile from '../../../../public/how-to-conduct-your-own-heuristic-evaluation.pdf';
import PDFWrapper from './PDFWrapper';

describe('<PDFViewer />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PDFWrapper onClose={vi.fn()} url={dummyFile} />
      </StoreProvider>
    );
  });
});
