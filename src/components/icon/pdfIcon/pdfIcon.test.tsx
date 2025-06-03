import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import PDFIcon from './pdfIcon';

describe('<PDFIcon />', () => {
  test('renders correctly', () => {
    render(<PDFIcon onClick={vi.fn()} />);
  });
});
