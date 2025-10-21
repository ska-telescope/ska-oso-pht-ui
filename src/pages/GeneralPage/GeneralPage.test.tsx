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
