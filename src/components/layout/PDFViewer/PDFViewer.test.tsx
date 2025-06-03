import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PDFViewer from './PDFViewer';

describe('<PDFViewer />', () => {
  test('renders correctly', () => {
    render(<PDFViewer open={false} onClose={vi.fn()} url="" />);
  });
});
