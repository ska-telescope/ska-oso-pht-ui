import { describe, test, it, vi, expect, beforeEach } from 'vitest';
import { cloneElement, useReducer } from 'react';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import DetailsPage from './DetailsPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import {
  DEFAULT_CONTINUUM_OBSERVATION_LOW,
  NOTIFICATION_DELAY_IN_SECONDS,
  PAGE_DETAILS,
  PROPOSAL_TYPE,
  STATUS_ERROR,
  STATUS_OK,
  TYPE_PST
} from '@/utils/constants';
import { setObservingMode } from '@/utils/autoLinking/AutoLinking';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { getProposalResolver, ProposalType } from '@/models/proposals/proposal';
import phtTranslations from '../../../public/locales/en/pht.json';
import { getProposalFormValues } from '@/models/proposals/useProposalForm';

// ---- Module mocks ----

const mockState = vi.hoisted(() => ({
  proposal: {} as Record<string, unknown>,
  updateProposal: vi.fn(),
  updatePageStatus: vi.fn()
}));
const mockNotifyError = vi.hoisted(() => vi.fn());
const mockNotifySuccess = vi.hoisted(() => vi.fn());

vi.mock('@utils/storage/store', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content1: Array(PAGE_DETAILS + 1).fill(STATUS_ERROR),
        content2: mockState.proposal
      },
      updateAppContent1: mockState.updatePageStatus,
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
    const [, rerender] = useReducer((count: number) => count + 1, 0);
    mockState.updateProposal.mockImplementation((proposal) => {
      mockState.proposal = proposal;
      rerender();
    });
    const methods = useForm<ProposalType>({
      mode: 'all',
      resolver: getProposalResolver(),
      defaultValues: getProposalFormValues(mockState.proposal)
    });
    const formValues = useWatch({ control: methods.control });
    return (
      <StoreProvider>
        <FormProvider {...methods}>
          <ThemeA11yProvider>
            {cloneElement(component)}
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
    vi.mocked(setObservingMode).mockImplementation(async (mode, getProposal, setProposal) => {
      const proposal = getProposal();
      setProposal({
        ...proposal,
        observations: [{ ...proposal.observations[0], type: mode }]
      });
      return { success: true };
    });
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

  it('stores abstract edits in RHF without writing to the legacy store', async () => {
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
    expect(mockState.updateProposal).not.toHaveBeenCalled();
  });

  it('stores a selected science category in RHF without writing to the legacy store', async () => {
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
    expect(mockState.updateProposal).not.toHaveBeenCalled();
  });

  it('updates the breadcrumb from RHF without writing to the legacy store', async () => {
    mockState.proposal = {
      proposalType: PROPOSAL_TYPE.STANDARD,
      scienceCategory: 1,
      abstract: ''
    };
    await renderPage();
    const input = screen.getByTestId('abstractId');
    fireEvent.change(input, { target: { value: 'A scientific summary' } });
    await waitFor(() => {
      expect(mockState.updatePageStatus.mock.lastCall?.[0][PAGE_DETAILS]).toBe(STATUS_OK);
    });
    expect(mockState.updateProposal).not.toHaveBeenCalled();
  });

  it('validates the character limit without truncating the abstract', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    const abstractInput = screen.getByTestId('abstractId');
    expect(abstractInput.tagName).toBe('TEXTAREA');
    expect(abstractInput).not.toHaveAttribute('maxlength');
    fireEvent.change(abstractInput, { target: { value: 'a'.repeat(2301) } });

    expect(abstractInput).toHaveValue('a'.repeat(2301));
    expect(JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '').abstract).toBe(
      'a'.repeat(2301)
    );
    expect(
      await screen.findByText('Too big: expected string to have <=2300 characters')
    ).toBeInTheDocument();
    expect(abstractInput).toHaveAttribute('aria-invalid', 'true');
    fireEvent.blur(abstractInput);
    expect(mockState.updateProposal).not.toHaveBeenCalled();
    fireEvent.change(abstractInput, { target: { value: 'a'.repeat(2300) } });
    await waitFor(() => expect(abstractInput).toHaveAttribute('aria-invalid', 'false'));
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
    const requiredError = 'Too small: expected string to have >=1 characters';
    mockState.proposal = svProposal();
    await renderPage();

    const abstractInput = screen.getByTestId('abstractId');
    fireEvent.blur(abstractInput);

    expect(await screen.findByText(requiredError)).toBeInTheDocument();
    expect(abstractInput).toHaveAttribute('aria-invalid', 'true');

    fireEvent.change(abstractInput, { target: { value: 'A scientific summary' } });
    await waitFor(() => {
      expect(screen.queryByText(requiredError)).not.toBeInTheDocument();
      expect(abstractInput).toHaveAttribute('aria-invalid', 'false');
    });

    fireEvent.change(abstractInput, { target: { value: '' } });
    expect(await screen.findByText(requiredError)).toBeInTheDocument();
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

  it('reflects observation changes without storing the mode in RHF', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    act(() => {
      mockState.updateProposal(
        svProposal({
          observations: [{ ...DEFAULT_CONTINUUM_OBSERVATION_LOW, id: 'obs-1', type: TYPE_PST }]
        })
      );
    });

    expect(observingModeCombobox()).toHaveTextContent('observationType.pst');
    expect(
      JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '')
    ).not.toHaveProperty('observingMode');
    expect(setObservingMode).not.toHaveBeenCalled();
  });

  it('sets the observing mode on the observation when changed, without a notification if there is no target', async () => {
    mockState.proposal = svProposal();
    await renderPage();

    await selectObservingMode('observationType.pst');

    expect(observingModeCombobox()).toHaveTextContent('observationType.pst');
    expect(mockState.updateProposal).toHaveBeenCalledWith(
      expect.objectContaining({
        observations: [expect.objectContaining({ type: TYPE_PST })]
      })
    );
    expect(
      JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '')
    ).not.toHaveProperty('observingMode');
    expect(setObservingMode).toHaveBeenCalledWith(
      TYPE_PST,
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ getValues: expect.any(Function) }),
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

  it('only updates the selected mode after the observation update succeeds', async () => {
    let completeUpdate!: () => void;
    vi.mocked(setObservingMode).mockImplementation(
      (mode, getProposal, setProposal) =>
        new Promise((resolve) => {
          completeUpdate = () => {
            const proposal = getProposal();
            setProposal({
              ...proposal,
              observations: [{ ...proposal.observations[0], type: mode }]
            });
            resolve({ success: true });
          };
        })
    );
    mockState.proposal = svProposal();
    await renderPage();

    await selectObservingMode('observationType.pst');

    expect(observingModeCombobox()).toHaveTextContent('observationType.continuum');
    expect(mockState.updateProposal).not.toHaveBeenCalled();

    await act(async () => {
      completeUpdate();
    });

    expect(observingModeCombobox()).toHaveTextContent('observationType.pst');
    expect(
      JSON.parse(screen.getByTestId('detailsFormValues').textContent ?? '')
    ).not.toHaveProperty('observingMode');
  });

  it('notifies of the error when setting the observing mode fails', async () => {
    vi.mocked(setObservingMode).mockResolvedValue({ success: false, error: 'bad' });
    mockState.proposal = svProposal({ targets: [{ id: 1, name: 'M2' }] });
    await renderPage();

    await selectObservingMode('observationType.pst');

    expect(mockNotifyError).toHaveBeenCalledWith('bad', NOTIFICATION_DELAY_IN_SECONDS);
    expect(mockNotifySuccess).not.toHaveBeenCalled();
    expect(observingModeCombobox()).toHaveTextContent('observationType.continuum');
    expect(mockState.updateProposal).not.toHaveBeenCalled();
  });
});
