import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LatexPreviewModal from './latexPreviewModal';

describe('<LatexPreviewModal />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<LatexPreviewModal value={''} open={true} onClose={mockAction} title="" />);
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
});
