import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { countWords } from '@utils/helpers.ts';
import GeneralPage from './GeneralPage';

describe('<GeneralPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <GeneralPage />
      </StoreProvider>
    );
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
    const baseHelperText = t('abstract.helper', {
      current: countWords(abstract),
      max: 10
    });
    return countWords(abstract) === 10
      ? `${baseHelperText} (MAX WORD COUNT REACHED)`
      : baseHelperText;
  };

  test('returns helper text with current and max word count, without max word count message when word count is below max', () => {
    countWords.mockReturnValue(8);
    const result = helperFunction('This abstract has less than ten words');
    expect(result).toBe('Current: 8, Max: 10');
  });

  test('appends max word count reached message when word count equals max', () => {
    countWords.mockReturnValue(10);
    const result = helperFunction('This abstract has exactly ten words now');
    expect(result).toBe('Current: 10, Max: 10 (MAX WORD COUNT REACHED)');
  });
});
