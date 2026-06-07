import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageBannerPPT from './PageBannerPPT';
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

describe('<PageBannerPPT />', () => {
  test('renders correctly', () => {
    wrapper(<PageBannerPPT pageNo={1} />);
  });
});

describe('isDisableEndpoints (Save button gate)', () => {
  const maxTitleWords = Number(phtTranslations.title.maxWord);

  const isDisableEndpoints = (title: string, id: string | null, loggedIn: boolean) => {
    if (
      loggedIn &&
      (id == null || title?.trim()?.length === 0 || countWords(title) > maxTitleWords)
    ) {
      return true;
    }
    return false;
  };

  test('is disabled when title is empty', () => {
    expect(isDisableEndpoints('', 'some-id', true)).toBe(true);
  });

  test('is disabled when proposal has no id', () => {
    expect(isDisableEndpoints('A valid title', null, true)).toBe(true);
  });

  test('is disabled when title exceeds the word limit', () => {
    const overLimit = Array(maxTitleWords + 1).fill('word').join(' ');
    expect(isDisableEndpoints(overLimit, 'some-id', true)).toBe(true);
  });

  test('is enabled when title is within the word limit and proposal has an id', () => {
    expect(isDisableEndpoints('A valid title', 'some-id', true)).toBe(false);
  });

  test('is enabled when title is exactly at the word limit', () => {
    const atLimit = Array(maxTitleWords).fill('word').join(' ');
    expect(isDisableEndpoints(atLimit, 'some-id', true)).toBe(false);
  });
});
