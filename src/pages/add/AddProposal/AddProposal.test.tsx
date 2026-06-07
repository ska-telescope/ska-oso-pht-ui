import { describe, expect, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddProposal from './AddProposal';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { countWords } from '@utils/helpers.ts';
import phtTranslations from '../../../../public/locales/en/pht.json';

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

describe('<AddProposal />', () => {
  test('renders correctly', () => {
    wrapper(<AddProposal />);
  });

  test('renders correctly when linking disabled', () => {
    wrapper(<AddProposal />);
  });
});

describe('contentValid (Create button gate)', () => {
  const maxTitleWords = Number(phtTranslations.title.maxWord);

  const titleValid = (title: string) => title?.length > 0 && countWords(title) <= maxTitleWords;

  test('is invalid when title is empty', () => {
    expect(titleValid('')).toBe(false);
  });

  test('is valid when title is within the word limit', () => {
    expect(titleValid('A short valid title')).toBe(true);
  });

  test('is valid when title is exactly at the word limit', () => {
    const atLimit = Array(maxTitleWords)
      .fill('word')
      .join(' ');
    expect(titleValid(atLimit)).toBe(true);
  });

  test('is invalid when title exceeds the word limit', () => {
    const overLimit = Array(maxTitleWords + 1)
      .fill('word')
      .join(' ');
    expect(titleValid(overLimit)).toBe(false);
  });
});
