import { afterEach, describe, expect, test, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { storageObject, StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { PROPOSAL_TYPE } from '@utils/constants.ts';
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

const mockOSD = vi.hoisted(() => ({ isSV: false }));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    isSV: mockOSD.isSV,
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
    const atLimit = Array(maxTitleWords).fill('word').join(' ');
    expect(titleValid(atLimit)).toBe(true);
  });

  test('is invalid when title exceeds the word limit', () => {
    const overLimit = Array(maxTitleWords + 1)
      .fill('word')
      .join(' ');
    expect(titleValid(overLimit)).toBe(false);
  });
});

describe('new proposal type', () => {
  const originalUseStore = storageObject.useStore;
  // A single store object, so TitleEntry's effect on application.content2 doesn't re-run every render
  const mockStore = {
    application: { content1: [], content2: {} },
    updateAppContent1: vi.fn(),
    updateAppContent2: vi.fn()
  };

  afterEach(() => {
    storageObject.useStore = originalUseStore;
    mockOSD.isSV = false;
    vi.clearAllMocks();
  });

  test('is set to science verification for an SV cycle', () => {
    mockOSD.isSV = true;
    storageObject.useStore = () => mockStore as any;
    wrapper(<AddProposal />);
    expect(mockStore.updateAppContent2).toHaveBeenCalledWith(
      expect.objectContaining({ proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION })
    );
  });

  test('is left unset for a normal cycle, so the user picks it', () => {
    storageObject.useStore = () => mockStore as any;
    wrapper(<AddProposal />);
    expect(mockStore.updateAppContent2).toHaveBeenCalledWith(
      expect.objectContaining({ proposalType: undefined })
    );
  });
});
