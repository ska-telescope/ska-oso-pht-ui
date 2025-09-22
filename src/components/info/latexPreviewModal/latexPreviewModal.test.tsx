import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import LatexPreviewModal from './latexPreviewModal';

describe('<LatexPreviewModal />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <LatexPreviewModal value={''} open={true} onClose={mockAction} title="" />
      </StoreProvider>
    );
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
});
