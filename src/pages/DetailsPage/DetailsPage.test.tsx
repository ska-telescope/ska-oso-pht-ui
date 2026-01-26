import { describe, test, vi, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { countWords } from '@utils/helpers.ts';
import DetailsPage, { checkAutoLink } from './DetailsPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import Target from '@/utils/types/target';

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
  const MAX_WORD = 10;
  const MAX_CHAR = 50;
  const mockSetProposal = vi.fn();
  const mockGetProposal = vi.fn(() => ({ abstract: '' }));

  const setValue = (e: string) => {
    if (countWords(e) < MAX_WORD || (countWords(e) === MAX_WORD && !/\s$/.test(e))) {
      mockSetProposal({ ...mockGetProposal(), abstract: e.substring(0, MAX_CHAR) });
    }
  };

  test('updates proposal when word count is below the maximum', () => {
    setValue('This is a valid abstract.');
    expect(mockSetProposal).toHaveBeenCalledWith({ abstract: 'This is a valid abstract.' });
  });

  test('updates proposal when word count equals the maximum and no trailing space', () => {
    setValue('One two three four five six seven eight nine ten');
    expect(mockSetProposal).toHaveBeenCalledWith({
      abstract: 'One two three four five six seven eight nine ten'
    });
  });

  test('does not update proposal when word count exceeds the maximum', () => {
    setValue('One two three four five six seven eight nine ten eleven');
    expect(mockSetProposal).not.toHaveBeenCalledWith({
      abstract: 'One two three four five six seven eight nine ten eleven'
    });
  });

  test('does not update proposal when word count equals the maximum but has trailing space', () => {
    setValue('One two three four five six seven eight nine ten ');
    expect(mockSetProposal).not.toHaveBeenCalledWith({
      abstract: 'One two three four five six seven eight nine ten '
    });
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
    const color = 'red'; // Simplified for testing
    const baseHelperText = t('abstract.helper', {
      current: countWords(abstract),
      max: 10
    });
    return countWords(abstract) === 10 ? (
      <>
        {baseHelperText} <span style={{ color: color }}>(MAX WORD COUNT REACHED)</span>
      </>
    ) : (
      baseHelperText
    );
  };

  test('returns helper text with current and max word count, without max word count message when word count is below max', () => {
    countWords.mockReturnValue(8);
    const result = helperFunction('This abstract has less than ten words altogether');
    expect(result).toBe('Current: 8, Max: 10');
  });

  test('appends max word count reached message when word count equals max', () => {
    countWords.mockReturnValue(10);
    const { container } = wrapper(
      helperFunction('This abstract has a word count of exactly ten words')
    );
    expect(container.textContent).toContain('Current: 10, Max: 10');
    expect(container.textContent).toContain('(MAX WORD COUNT REACHED)');
  });
});

describe('checkAutoLink function works as expected', () => {
  const mockTarget: Target = {
    kind: 0,
    decStr: '-00:49:23.700',
    id: 1,
    name: 'm2',
    b: 0,
    l: 0,
    raStr: '21:33:27.0200',
    redshift: '',
    referenceFrame: 'icrs',
    vel: '-3.6',
    velType: 0,
    velUnit: 0
  };

  test('autoLink, obs mode but no targets - no auto link triggered', () => {
    const isAutolink = checkAutoLink(true, [], 'continuum');
    expect(isAutolink).toBe(false);
  });

  test('autoLink, no obs mode but targets - no auto link triggered', () => {
    const isAutolink = checkAutoLink(true, [mockTarget], '');
    expect(isAutolink).toBe(false);
  });

  test('autoLink, no obs mode and no targets - no auto link triggered', () => {
    const isAutolink = checkAutoLink(true, [], '');
    expect(isAutolink).toBe(false);
  });

  test('no autoLink, science category and targets - no auto link triggered', () => {
    const isAutolink = checkAutoLink(false, [mockTarget], 'Cosmology');
    expect(isAutolink).toBe(false);
  });

  test('no autoLink, no science category and no targets - no auto link triggered', () => {
    const isAutolink = checkAutoLink(false, [], '');
    expect(isAutolink).toBe(false);
  });

  test('autoLink, obs mode and targets - auto link triggered', () => {
    const isAutolink = checkAutoLink(true, [mockTarget], 'continuum');
    expect(isAutolink).toBe(true);
  });

  test('autoLink, obs mode and targets - auto link triggered', () => {
    const isAutolink = checkAutoLink(true, [mockTarget], 'spectral');
    expect(isAutolink).toBe(true);
  });
});
