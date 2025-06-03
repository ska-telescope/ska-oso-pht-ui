import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import LatexPreviewModal from './latexPreviewModal';

describe('<LatexPreviewModal />', () => {
  test('renders correctly', () => {
    render(<LatexPreviewModal value={''} open={false} onClose={vi.fn()} title="" />);
  });
});
