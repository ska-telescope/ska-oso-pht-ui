import { describe, test, vi, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TitlePage from './TitlePage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'CYCLE-1',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('<TitlePage />', () => {
  test('renders correctly', () => {
    wrapper(<TitlePage />);
  });
});

describe('setValue function', () => {
  const MAX_CHAR = 50;
  const mockSetProposal = vi.fn();
  const mockGetProposal = vi.fn(() => ({ title: '' }));

  const setValue = (e: string) => {
    mockSetProposal({ ...mockGetProposal(), title: e.substring(0, MAX_CHAR) });
  };

  test('updates proposal when word count is below the maximum', () => {
    setValue('This is a valid title.');
    expect(mockSetProposal).toHaveBeenCalledWith({ title: 'This is a valid title.' });
  });

  test('updates proposal when word count equals the maximum', () => {
    setValue('One two three four five six seven eight nine ten');
    expect(mockSetProposal).toHaveBeenCalledWith({
      title: 'One two three four five six seven eight nine ten'
    });
  });

  test('updates proposal even when word count exceeds the maximum', () => {
    const overLimitTitle = 'one two three four five six seven eight nine ten x';
    setValue(overLimitTitle);
    expect(mockSetProposal).toHaveBeenCalledWith({ title: overLimitTitle });
  });

  test('truncates proposal title at MAX_CHAR characters', () => {
    const longTitle = 'a'.repeat(60);
    setValue(longTitle);
    expect(mockSetProposal).toHaveBeenCalledWith({ title: 'a'.repeat(MAX_CHAR) });
  });
});
