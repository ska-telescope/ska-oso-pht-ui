import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import LatexPreviewModal from './latexPreviewModal';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('<LatexPreviewModal />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<LatexPreviewModal value={''} open={true} onClose={mockAction} title="" />);
    screen.getByTestId('cancelButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
});
