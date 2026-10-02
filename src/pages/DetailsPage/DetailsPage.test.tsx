import { describe, test, it, vi, expect, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import DetailsPage from './DetailsPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  NOTIFICATION_DELAY_IN_SECONDS,
  PROPOSAL_TYPE,
  TYPE_PST
} from '@/utils/constants';
import { setObservingMode } from '@/utils/autoLinking/AutoLinking';

// ---- Module mocks ----

const mockState = vi.hoisted(() => ({ proposal: {} as Record<string, unknown> }));
const mockNotifyError = vi.hoisted(() => vi.fn());
const mockNotifySuccess = vi.hoisted(() => vi.fn());

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: { content1: [], content2: mockState.proposal },
      updateAppContent1: vi.fn(),
      updateAppContent2: vi.fn(),
      helpComponent: vi.fn(),
      helpComponentURL: vi.fn()
    })
  },
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', async () => {
  const { SA_AA2 } = await vi.importActual<typeof import('@/utils/constants')>('@/utils/constants');
  return {
    useOSDAccessors: () => ({
      osdLOW: {
        subArrays: [{ subArray: SA_AA2, cbfModes: ['vis', 'pst'], numberZoomChannels: 42 }]
      },
      osdMID: undefined
    })
  };
});

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({ axiosClient: {} })
}));

vi.mock('@/utils/notify/useNotify', () => ({
  useNotify: () => ({ notifyError: mockNotifyError, notifySuccess: mockNotifySuccess })
}));

vi.mock('@/utils/autoLinking/AutoLinking', () => ({
  setObservingMode: vi.fn()
}));

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

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

// ---- Helpers ----

const svProposal = (extra: Record<string, unknown> = {}) => ({
  proposalType: PROPOSAL_TYPE.SCIENCE_VERIFICATION,
  scienceCategory: null,
  abstract: '',
  targets: [],
  observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1' }],
  ...extra
});

const renderPage = async () => {
  await act(async () => {
    render(<DetailsPage />);
  });
};

const observingModeCombobox = () =>
  within(screen.getByTestId('observationType')).getByRole('combobox');

const selectObservingMode = async (label: string) => {
  fireEvent.mouseDown(observingModeCombobox());
  await act(async () => {
    fireEvent.click(screen.getByRole('option', { name: label }));
  });
};

// ---- Tests ----

describe('<DetailsPage /> observing mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(setObservingMode).mockResolvedValue({ success: true });
  });

  it('shows the science category and no observing mode for standard proposals', async () => {
    mockState.proposal = {
      proposalType: PROPOSAL_TYPE.STANDARD,
      scienceCategory: null,
      abstract: ''
    };
    await renderPage();

    expect(screen.getByTestId('categoryId')).toBeInTheDocument();
    expect(screen.queryByTestId('observationType')).not.toBeInTheDocument();
  });

  it('shows the observing mode of the observation and no science category for SV proposals', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    expect(screen.queryByTestId('categoryId')).not.toBeInTheDocument();
    expect(observingModeCombobox()).toHaveTextContent('observationType.continuum');
  });

  it('shows continuum for SV proposals without an observation', async () => {
    mockState.proposal = svProposal({ observations: [] });
    await renderPage();

    expect(observingModeCombobox()).toHaveTextContent('observationType.continuum');
  });

  it('sets the observing mode on the observation when changed, without a notification if there is no target', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    await selectObservingMode('observationType.pst');

    expect(setObservingMode).toHaveBeenCalledWith(
      TYPE_PST,
      expect.any(Function),
      expect.any(Function),
      {},
      42
    );
    expect(mockNotifySuccess).not.toHaveBeenCalled();
    expect(mockNotifyError).not.toHaveBeenCalled();
  });

  it('notifies of the auto-link success when changed with a target', async () => {
    mockState.proposal = svProposal({ targets: [{ id: 1, name: 'M2' }] });
    await renderPage();

    await selectObservingMode('observationType.pst');

    expect(mockNotifySuccess).toHaveBeenCalledWith(
      'autoLink.success',
      NOTIFICATION_DELAY_IN_SECONDS
    );
  });

  it('notifies of the error when setting the observing mode fails', async () => {
    vi.mocked(setObservingMode).mockResolvedValue({ success: false, error: 'bad' });
    mockState.proposal = svProposal({ targets: [{ id: 1, name: 'M2' }] });
    await renderPage();

    await selectObservingMode('observationType.pst');

    expect(mockNotifyError).toHaveBeenCalledWith('bad', NOTIFICATION_DELAY_IN_SECONDS);
    expect(mockNotifySuccess).not.toHaveBeenCalled();
  });
});
