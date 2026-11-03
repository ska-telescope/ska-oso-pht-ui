import { describe, test, it, vi, expect, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import DetailsPage from './DetailsPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  NOTIFICATION_DELAY_IN_SECONDS,
  PROPOSAL_TYPE,
  TYPE_PST
} from '@/utils/constants';
import { setObservingMode } from '@/utils/autoLinking/AutoLinking';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { getProposalSchema, ProposalType } from '@/models/proposals/proposal';
import { zodResolver } from '@hookform/resolvers/zod';
import phtTranslations from '../../../public/locales/en/pht.json';

// ---- Module mocks ----

const mockState = vi.hoisted(() => ({
  proposal: {} as Record<string, unknown>,
  updateProposal: vi.fn()
}));
const mockNotifyError = vi.hoisted(() => vi.fn());
const mockNotifySuccess = vi.hoisted(() => vi.fn());

vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: { content1: [], content2: mockState.proposal },
      updateAppContent1: vi.fn(),
      updateAppContent2: mockState.updateProposal,
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

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => {
      if (key === 'abstract.maxChar') return '2300';
      if (key === 'abstract.maxWord') return '250';
      if (key === 'abstract.minDisplayRows') return '10';
      return key;
    }
  })
}));

const wrapper = (component: React.ReactElement) => {
  const FormWrapper = () => {
    const proposal = mockState.proposal as {
      proposalType?: ProposalType['proposalType'];
      observations?: { type?: string }[];
      abstract?: string;
      scienceCategory?: number | null;
    };
    const methods = useForm<ProposalType>({
      mode: 'all',
      resolver: zodResolver(getProposalSchema()),
      defaultValues: {
        title: '',
        proposalType: proposal.proposalType ?? null,
        observingMode: proposal.observations?.[0]?.type ?? null,
        abstract: proposal.abstract ?? '',
        scienceCategory: proposal.scienceCategory ?? null,
        investigators: []
      }
    });
    const formValues = useWatch({ control: methods.control });
    return (
      <StoreProvider>
        <FormProvider {...methods}>
          <ThemeA11yProvider>
            {component}
            <output data-testid="detailsFormValues">{JSON.stringify(formValues)}</output>
          </ThemeA11yProvider>
        </FormProvider>
      </StoreProvider>
    );
  };
  return render(<FormWrapper />);
};

describe('<DetailsPage />', () => {
  test('renders correctly', async () => {
    await act(async () => {
      wrapper(<DetailsPage />);
    });
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
    const { container } = render(
      <>{helperFunction('This abstract has a word count that exceeds the ten word limit here')}</>
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
    wrapper(<DetailsPage />);
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
    mockState.updateProposal.mockClear();
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

  it('stores the abstract field in RHF and saves it to the proposal', async () => {
    mockState.proposal = {
      proposalType: PROPOSAL_TYPE.STANDARD,
      scienceCategory: null,
      abstract: ''
    };
    await renderPage();

    const abstractInput = screen.getAllByRole('textbox')[0];
    await userEvent.clear(abstractInput);
    await userEvent.type(abstractInput, 'A new scientific summary');
    await waitFor(() =>
      expect(JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '').abstract).toBe(
        'A new scientific summary'
      )
    );

    fireEvent.blur(abstractInput);
    expect(mockState.updateProposal).toHaveBeenLastCalledWith(
      expect.objectContaining({ abstract: 'A new scientific summary' })
    );
  });

  it('stores a selected science category in RHF and the proposal', async () => {
    mockState.proposal = {
      proposalType: PROPOSAL_TYPE.STANDARD,
      scienceCategory: null,
      abstract: ''
    };
    await renderPage();

    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'High Energy Cosmic Particles' }));

    expect(
      JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '').scienceCategory
    ).toBe(7);
    expect(mockState.updateProposal).toHaveBeenLastCalledWith(
      expect.objectContaining({ scienceCategory: 7 })
    );
  });

  it('renders a multiline abstract and truncates changes at the character limit', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    const abstractInput = screen.getByTestId('abstractId');
    expect(abstractInput.tagName).toBe('TEXTAREA');
    expect(abstractInput).toHaveAttribute('maxlength', '2300');
    fireEvent.change(abstractInput, { target: { value: 'a'.repeat(2301) } });

    expect(abstractInput).toHaveValue('a'.repeat(2300));
    expect(JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '').abstract).toBe(
      'a'.repeat(2300)
    );
    fireEvent.blur(abstractInput);
    expect(mockState.updateProposal).toHaveBeenLastCalledWith(
      expect.objectContaining({ abstract: 'a'.repeat(2300) })
    );
  });

  it('displays the abstract validation error from the form', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    const wordLimit = Number(phtTranslations.abstract.maxWord);
    const abstractInput = screen.getByTestId('abstractId');
    fireEvent.change(abstractInput, {
      target: {
        value: Array(wordLimit + 1)
          .fill('a')
          .join(' ')
      }
    });

    expect(
      await screen.findByText(
        `${phtTranslations.specialCharacters.numWord} ${wordLimit + 1} / ${wordLimit}`
      )
    ).toBeInTheDocument();
    expect(abstractInput).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays a required error on blur and clears it when an abstract is entered', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    const abstractInput = screen.getByTestId('abstractId');
    fireEvent.blur(abstractInput);

    expect(await screen.findByText(phtTranslations.abstract.empty)).toBeInTheDocument();
    expect(abstractInput).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(abstractInput, { target: { value: 'A scientific summary' } });
    await waitFor(() => {
      expect(screen.queryByText(phtTranslations.abstract.empty)).not.toBeInTheDocument();
      expect(abstractInput).toHaveAttribute('aria-invalid', 'false');
    });

    fireEvent.change(abstractInput, { target: { value: '' } });
    expect(await screen.findByText(phtTranslations.abstract.empty)).toBeInTheDocument();
  });

  it('previews the current abstract as LaTeX', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    fireEvent.change(screen.getByTestId('abstractId'), {
      target: { value: 'Updated scientific summary' }
    });
    fireEvent.click(screen.getByRole('button', { name: 'preview latex' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('Updated scientific summary');
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

    expect(
      JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '').observingMode
    ).toBe(TYPE_PST);
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

  it('only updates the selected mode and form after the observation update succeeds', async () => {
    let completeUpdate!: (result: { success: true }) => void;
    vi.mocked(setObservingMode).mockReturnValue(
      new Promise((resolve) => {
        completeUpdate = resolve;
      })
    );
    mockState.proposal = svProposal();
    await renderPage();

    await selectObservingMode('observationType.pst');

    expect(observingModeCombobox()).toHaveTextContent('observationType.continuum');
    expect(
      JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '').observingMode
    ).toBe('continuum');

    await act(async () => {
      completeUpdate({ success: true });
    });

    expect(observingModeCombobox()).toHaveTextContent('observationType.pst');
    expect(
      JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '').observingMode
    ).toBe(TYPE_PST);
  });

  it('notifies of the error when setting the observing mode fails', async () => {
    vi.mocked(setObservingMode).mockResolvedValue({ success: false, error: 'bad' });
    mockState.proposal = svProposal({ targets: [{ id: 1, name: 'M2' }] });
    await renderPage();

    await selectObservingMode('observationType.pst');

    expect(mockNotifyError).toHaveBeenCalledWith('bad', NOTIFICATION_DELAY_IN_SECONDS);
    expect(mockNotifySuccess).not.toHaveBeenCalled();
    expect(observingModeCombobox()).toHaveTextContent('observationType.continuum');
    expect(
      JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '').observingMode
    ).toBe('continuum');
  });
});
