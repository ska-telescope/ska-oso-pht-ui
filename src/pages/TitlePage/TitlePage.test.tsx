import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { countWords } from '@utils/helpers.ts';
import TitlePage from './TitlePage';

describe('<TitlePage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TitlePage />
      </StoreProvider>
    );
  });
});

describe('setValue function', () => {
  const MAX_WORD = 10;
  const MAX_CHAR = 50;
  const mockSetProposal = vi.fn();
  const mockGetProposal = vi.fn(() => ({ title: '' }));

  const setValue = (e: string) => {
    if (countWords(e) < MAX_WORD || (countWords(e) === MAX_WORD && !/\s$/.test(e))) {
      mockSetProposal({ ...mockGetProposal(), title: e.substring(0, MAX_CHAR) });
    }
  };

  test('updates proposal when word count is below the maximum', () => {
    setValue('This is a valid title.');
    expect(mockSetProposal).toHaveBeenCalledWith({ title: 'This is a valid title.' });
  });

  test('updates proposal when word count equals the maximum and no trailing space', () => {
    setValue('One two three four five six seven eight nine ten');
    expect(mockSetProposal).toHaveBeenCalledWith({
      title: 'One two three four five six seven eight nine ten'
    });
  });

  test('does not update proposal when word count exceeds the maximum', () => {
    setValue('One two three four five six seven eight nine ten eleven');
    expect(mockSetProposal).not.toHaveBeenCalledWith({
      title: 'One two three four five six seven eight nine ten eleven'
    });
  });

  test('does not update proposal when word count equals the maximum but has trailing space', () => {
    setValue('One two three four five six seven eight nine ten ');
    expect(mockSetProposal).not.toHaveBeenCalledWith({
      title: 'One two three four five six seven eight nine ten '
    });
  });
});
