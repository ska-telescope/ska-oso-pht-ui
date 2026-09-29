import { describe, test, vi, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import DetailsPage from './DetailsPage';
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
    osdCycleId: 'SKAO_2027_1',
    osdCycleDescription: 'Science Verification',
    osdOpens: () => '27-03-2026 12:00:00',
    osdCloses: () => '12-05-2026 04:00:00',
    osdCyclePolicy: {
      maxTargets: 1,
      maxObservations: 1
    }
  })
}));

describe('<DetailsPage />', () => {
  test('renders correctly', () => {
    wrapper(<DetailsPage />);
  });
});

describe('setValue function', () => {
  const MAX_CHAR = 50;
  const mockSetProposal = vi.fn();
  const mockGetProposal = vi.fn(() => ({ abstract: '' }));

  const setValue = (e: string) => {
    mockSetProposal({ ...mockGetProposal(), abstract: e.substring(0, MAX_CHAR) });
  };

  test('updates proposal when word count is below the maximum', () => {
    setValue('This is a valid abstract.');
    expect(mockSetProposal).toHaveBeenCalledWith({ abstract: 'This is a valid abstract.' });
  });

  test('updates proposal even when word count exceeds the maximum', () => {
    const overLimitAbstract = 'one two three four five six seven eight nine ten x';
    setValue(overLimitAbstract);
    expect(mockSetProposal).toHaveBeenCalledWith({ abstract: overLimitAbstract });
  });

  test('truncates abstract at MAX_CHAR characters', () => {
    const longAbstract = 'a'.repeat(60);
    setValue(longAbstract);
    expect(mockSetProposal).toHaveBeenCalledWith({ abstract: 'a'.repeat(MAX_CHAR) });
  });
});

describe('Abstract helperFunction', () => {
  const t = vi.fn((key, params) => {
    if (key === 'abstract.helper') {
      return `Current: ${params.current}, Max: ${params.max}`;
    }
  });
  const countWords = vi.fn();

  const helperFunction = (abstract: string) => {
    const color = 'red';
    const baseHelperText = t('abstract.helper', {
      current: countWords(abstract),
      max: 10
    });
    return countWords(abstract) > 10 ? (
      <>
        {baseHelperText} <span style={{ color: color }}>(WORD LIMIT EXCEEDED)</span>
      </>
    ) : (
      baseHelperText
    );
  };

  test('returns helper text without over-limit message when word count is below max', () => {
    countWords.mockReturnValue(8);
    const result = helperFunction('This abstract has less than ten words altogether');
    expect(result).toBe('Current: 8, Max: 10');
  });

  test('returns helper text without over-limit message when word count equals max', () => {
    countWords.mockReturnValue(10);
    const result = helperFunction('This abstract has a word count of exactly ten words');
    expect(result).toBe('Current: 10, Max: 10');
  });

  test('appends word limit exceeded message when word count exceeds max', () => {
    countWords.mockReturnValue(11);
    const { container } = wrapper(
      helperFunction('This abstract has a word count that exceeds the ten word limit here')
    );
    expect(container.textContent).toContain('Current: 11, Max: 10');
    expect(container.textContent).toContain('(WORD LIMIT EXCEEDED)');
  });
});
