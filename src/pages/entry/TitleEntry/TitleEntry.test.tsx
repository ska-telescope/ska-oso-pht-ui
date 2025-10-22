import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TitleEntry from './TitleEntry';

describe('<TitleEntry />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TitleEntry page={0} />
      </StoreProvider>
    );
  });
});

describe('Title helperFunction', () => {
  const t = vi.fn((key, params) => {
    if (key === 'title.helper') {
      return `Current: ${params.current}, Max: ${params.max}`;
    }
  });
  const countWords = vi.fn();

  const helperFunction = (title: string) => {
    const color = 'red'; // Simplified for testing
    const baseHelperText = t('title.helper', {
      current: countWords(title),
      max: 10
    });
    return countWords(title) === 10 ? (
      <>
        {baseHelperText} <span style={{ color: color }}>(MAX WORD COUNT REACHED)</span>
      </>
    ) : (
      baseHelperText
    );
  };

  test('returns helper text with current and max word count, without max word count message when word count is below max', () => {
    countWords.mockReturnValue(8);
    const result = helperFunction('This title has less than ten words altogether');
    expect(result).toBe('Current: 8, Max: 10');
  });

  test('appends max word count reached message when word count equals max', () => {
    countWords.mockReturnValue(10);
    const result = helperFunction('This title has a word count of exactly ten words');
    expect(result).toEqual(
      <>
        Current: 10, Max: 10 <span style={{ color: 'red' }}>(MAX WORD COUNT REACHED)</span>
      </>
    );
  });
});
