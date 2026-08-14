import { beforeEach, describe, expect, test, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageBannerPPT from './PageBannerPPT';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { countWords } from '@utils/helpers.ts';
import PutProposal from '@/services/axios/put/putProposal/putProposal';
import { AUTO_SAVE_INTERVAL } from '@utils/constants.ts';
import phtTranslations from '../../../../public/locales/en/pht.json';

const mockUpdateAppContent2 = vi.fn();
const mockNotifySuccess = vi.fn();
const mockNotifyError = vi.fn();
const mockContent2 = { current: {} as any };

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: () => true
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  StoreProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  storageObject: {
    useStore: () => ({
      application: {
        content1: [0, 0, 0, 0, 0, 0, 0, 0],
        content2: mockContent2.current,
        content4: []
      },
      updateAppContent1: vi.fn(),
      updateAppContent2: mockUpdateAppContent2,
      updateAppContent5: vi.fn()
    })
  }
}));

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({
    notifySuccess: mockNotifySuccess,
    notifyError: mockNotifyError,
    notifyWarning: vi.fn(),
    notifyInfo: vi.fn(),
    notifyClear: vi.fn()
  })
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({})
}));

vi.mock('@/services/axios/put/putProposal/putProposal', () => ({
  default: vi.fn()
}));

vi.mock('@/services/axios/post/postProposalValidate/postProposalValidate', () => ({
  default: vi.fn().mockResolvedValue({ valid: true })
}));

vi.mock('@/utils/validation/validation', () => ({
  useValidateProposal: () => () => []
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({ isSV: false })
}));

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({ t: (key: string) => key })
}));

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
  const maxAbstractWords = Number(phtTranslations.abstract.maxWord);

  const isDisableEndpoints = (
    title: string,
    abstract: string,
    id: string | null,
    loggedIn: boolean
  ) => {
    if (
      loggedIn &&
      (id == null ||
        title?.trim()?.length === 0 ||
        countWords(title) > maxTitleWords ||
        countWords(abstract) > maxAbstractWords)
    ) {
      return true;
    }
    return false;
  };

  test('is disabled when title is empty', () => {
    expect(isDisableEndpoints('', 'valid abstract', 'some-id', true)).toBe(true);
  });

  test('is disabled when proposal has no id', () => {
    expect(isDisableEndpoints('A valid title', 'valid abstract', null, true)).toBe(true);
  });

  test('is disabled when title exceeds the word limit', () => {
    const overLimit = Array(maxTitleWords + 1)
      .fill('word')
      .join(' ');
    expect(isDisableEndpoints(overLimit, 'valid abstract', 'some-id', true)).toBe(true);
  });

  test('is disabled when abstract exceeds the word limit', () => {
    const overLimit = Array(maxAbstractWords + 1)
      .fill('word')
      .join(' ');
    expect(isDisableEndpoints('A valid title', overLimit, 'some-id', true)).toBe(true);
  });

  test('is enabled when title is within the word limit and proposal has an id', () => {
    expect(isDisableEndpoints('A valid title', 'valid abstract', 'some-id', true)).toBe(false);
  });

  test('is enabled when title is exactly at the word limit', () => {
    const atLimit = Array(maxTitleWords).fill('word').join(' ');
    expect(isDisableEndpoints(atLimit, 'valid abstract', 'some-id', true)).toBe(false);
  });

  test('is enabled when abstract is exactly at the word limit', () => {
    const atLimit = Array(maxAbstractWords).fill('word').join(' ');
    expect(isDisableEndpoints('A valid title', atLimit, 'some-id', true)).toBe(false);
  });
});

describe('<PageBannerPPT /> save feedback', () => {
  const NEW_STAMP = '2026-08-13T10:00:00.000000Z';

  const savedResponse = {
    prsl_id: 'prsl-123',
    metadata: {
      version: 2,
      created_by: 'creator',
      created_on: '2026-01-01T00:00:00.000000Z',
      pdm_version: '18.0.0',
      last_modified_by: 'newuser',
      last_modified_on: NEW_STAMP
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // isDisableEndpoints() must return false: id set, non-empty title, and
    // title/abstract word counts inside the pht.json limits.
    mockContent2.current = {
      id: 'prsl-123',
      title: 'A valid title',
      abstract: 'A valid abstract',
      lastUpdated: '2026-08-13T09:00:00.000000Z',
      lastUpdatedBy: 'olduser',
      version: 1
    };
  });

  test('a manual save toasts and stores the response timestamp', async () => {
    vi.mocked(PutProposal).mockResolvedValue(savedResponse as any);
    wrapper(<PageBannerPPT pageNo={1} />);

    screen.getByTestId('saveBtn').click();

    await waitFor(() => {
      expect(mockNotifySuccess).toHaveBeenCalledWith('saveBtn.success');
    });
    expect(mockUpdateAppContent2.mock.calls[0][0]).toMatchObject({
      title: 'A valid title',
      lastUpdated: NEW_STAMP
    });
  });

  test('an auto-save stores the timestamp without a success toast', async () => {
    vi.useFakeTimers();
    vi.mocked(PutProposal).mockResolvedValue(savedResponse as any);
    wrapper(<PageBannerPPT pageNo={1} />);

    await act(async () => {
      vi.advanceTimersByTime(AUTO_SAVE_INTERVAL * 1000);
    });

    expect(mockUpdateAppContent2.mock.calls[0][0]).toMatchObject({ lastUpdated: NEW_STAMP });
    expect(mockNotifySuccess).not.toHaveBeenCalled();
    vi.useRealTimers();
  });

  test('a successful response without metadata still toasts but leaves the store alone', async () => {
    vi.mocked(PutProposal).mockResolvedValue({ prsl_id: 'prsl-123' } as any);
    wrapper(<PageBannerPPT pageNo={1} />);

    screen.getByTestId('saveBtn').click();

    await waitFor(() => {
      expect(mockNotifySuccess).toHaveBeenCalledWith('saveBtn.success');
    });
    expect(mockUpdateAppContent2).not.toHaveBeenCalled();
  });

  test('renders the last saved label', () => {
    wrapper(<PageBannerPPT pageNo={1} />);
    expect(screen.getByTestId('lastSavedTestId')).toBeInTheDocument();
  });
});
