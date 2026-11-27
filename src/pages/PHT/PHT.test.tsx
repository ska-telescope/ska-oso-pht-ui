import { render, screen, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, test, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import { MemoryRouter } from 'react-router';
import PHT from './PHT';
import { NAV, PATH, PMT, PROPOSAL_STATUS, SENSITIVITY_STATE } from '@/utils/constants';
import { saveValuesToOda } from '@/models/proposals/useProposalOda';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { SKAThemeProvider, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import { linkTarget } from '@/utils/autoLinking/AutoLinking';
import * as proposalForm from '@/models/proposals/useProposalForm';
import { ProposalType } from '@/models/proposals/proposal';

const mockNavigate = vi.fn();
const mockSetHelp = vi.fn();
const mockPathname = { current: PATH[0] };
// The form values of the proposal open when PHT mounts, over the defaults of a new proposal
const mockOpenProposal: { current: Partial<ProposalType> } = { current: { prslId: 'prp-123' } };
const mockApplicationContent5 = { current: { message: '', level: '', delay: 0 } as any };

vi.mock('react-router', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname.current }),
  MemoryRouter: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Routes: () => null,
  Route: () => null
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: () => true
}));

vi.mock('@utils/storage/store', () => ({
  StoreProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  storageObject: {
    useStore: () => ({
      application: {
        content5: mockApplicationContent5.current
      },
      help: ['', '', ''],
      helpToggle: false,
      helpComponent: vi.fn(),
      helpComponentURL: vi.fn(),
      updateAppContent5: vi.fn()
    })
  }
}));

vi.mock('@/models/proposals/useProposalOda', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/models/proposals/useProposalOda')>()),
  saveValuesToOda: vi.fn().mockResolvedValue({ data: { id: 'prp-123' } })
}));

vi.mock('@/services/api/useAxiosInterceptor', () => ({
  default: vi.fn(),
  useAxiosInterceptor: vi.fn()
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    autoLink: true,
    osdCloses: () => '',
    osdCountdown: '',
    osdCycleId: 'cycle-1',
    osdCycleDescription: 'Cycle 1',
    osdOpens: () => '',
    isSV: false
  })
}));

vi.mock('@/utils/help/useHelp', () => ({
  useHelp: () => ({
    setHelp: mockSetHelp
  })
}));

vi.mock('@ska-telescope/ska-gui-components', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    AppWrapper: () => <div data-testid="app-wrapper" />
  };
});

const wrapper = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <StoreProvider>
        <ThemeA11yProvider>
          <SKAThemeProvider themeMode={THEME_LIGHT} accessibilityMode={0}>
            {component}
          </SKAThemeProvider>
        </ThemeA11yProvider>
      </StoreProvider>
    </MemoryRouter>
  );
};

const noop = () => {};
const fullProps = {
  themeMode: '',
  setThemeMode: noop,
  accessibilityMode: 0,
  setAccessibilityMode: noop,
  buttonVariant: '',
  setButtonVariant: noop,
  flatten: false,
  setFlatten: noop
};

const { mockProposal } = vi.hoisted(() => ({
  mockProposal: {
    prslId: 'prp-123',
    scienceCategory: null,
    abstract: 'Test abstract',
    targets: [{ id: '1', name: 'Target 1' }] as ProposalType['targets'],
    observations: [] as any[],
    targetObservation: [] as any[],
    calibrationStrategy: [] as any[]
  }
}));

// PHT's form, opened on mockOpenProposal as a load would leave it
const realUseProposalForm = proposalForm.useProposalForm;
let formSpy: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  formSpy = vi.spyOn(proposalForm, 'useProposalForm').mockImplementation((osd) =>
    realUseProposalForm(osd, {
      ...proposalForm.getProposalFormDefaults(),
      ...mockOpenProposal.current
    })
  );
  return () => formSpy.mockRestore();
});
const currentForm = () => formSpy.mock.results[formSpy.mock.results.length - 1].value;

// PHT's own effects (specifically the auto-repair one under test) don't depend on the routed
// page - stub the default '/' route so the test doesn't have to satisfy LandingPage's own
// data-loading requirements.
vi.mock('../LandingPage/LandingPage', () => ({
  default: () => <div data-testid="landing-page-stub" />
}));

vi.mock('@/utils/autoLinking/AutoLinking', () => ({
  linkTarget: vi.fn().mockResolvedValue({ success: true })
}));

const defaultProps = {
  themeMode: '',
  setThemeMode: () => {},
  accessibilityMode: 0,
  setAccessibilityMode: () => {},
  buttonVariant: 'blue',
  setButtonVariant: () => {},
  flatten: false,
  setFlatten: () => {}
};

const renderPHT = () => {
  const view = wrapper(<PHT {...defaultProps} />);
  const rerenderPHT = () => {
    view.rerender(
      <MemoryRouter>
        <StoreProvider>
          <ThemeA11yProvider>
            <SKAThemeProvider themeMode={THEME_LIGHT} accessibilityMode={0}>
              <PHT {...defaultProps} />
            </SKAThemeProvider>
          </ThemeA11yProvider>
        </StoreProvider>
      </MemoryRouter>
    );
  };

  return { ...view, rerenderPHT };
};

describe('<PHT />', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.current = PATH[0];
    mockOpenProposal.current = { prslId: 'prp-123' };
    mockApplicationContent5.current = { message: '', level: '', delay: 0 };
  });

  test('renders correctly', () => {
    renderPHT();
  });

  test('renders the footer notification when a notification message is present', () => {
    mockApplicationContent5.current = {
      message: 'Test notification message',
      level: 'success',
      delay: 0
    };

    renderPHT();

    expect(screen.getByText('Test notification message')).toBeInTheDocument();
  });

  test('auto-saves when navigating between proposal pages', async () => {
    const { rerenderPHT } = renderPHT();

    mockPathname.current = NAV[1];
    rerenderPHT();

    mockPathname.current = NAV[2];
    rerenderPHT();

    await waitFor(() => {
      expect(saveValuesToOda).toHaveBeenCalledWith(
        {
          prslId: 'prp-123',
          cycle: '',
          title: '',
          proposalType: { type: null, subTypes: [] },
          abstract: '',
          scienceCategory: null,
          investigators: [],
          targets: [],
          targetObservation: [],
          calibrationStrategy: [],
          sciencePDF: null,
          technicalPDF: null,
          dataProducts: [],
          observations: []
        },
        PROPOSAL_STATUS.DRAFT
      );
    });
  });

  test('auto-saves when navigating from proposal page to home', async () => {
    const { rerenderPHT } = renderPHT();

    mockPathname.current = NAV[3];
    rerenderPHT();

    mockPathname.current = PATH[0];
    rerenderPHT();

    await waitFor(() => {
      expect(saveValuesToOda).toHaveBeenCalledWith(
        {
          prslId: 'prp-123',
          cycle: '',
          title: '',
          proposalType: { type: null, subTypes: [] },
          abstract: '',
          scienceCategory: null,
          investigators: [],
          targets: [],
          targetObservation: [],
          calibrationStrategy: [],
          sciencePDF: null,
          technicalPDF: null,
          dataProducts: [],
          observations: []
        },
        PROPOSAL_STATUS.DRAFT
      );
    });
    // Returning home closes the proposal, after its values were taken for the save
    expect(currentForm().getValues()).toEqual(proposalForm.getProposalFormDefaults());
  });

  test('closes the proposal without saving when leaving the editor for PMT', async () => {
    const { rerenderPHT } = renderPHT();

    mockPathname.current = NAV[3];
    rerenderPHT();

    mockPathname.current = PMT[0];
    rerenderPHT();

    expect(currentForm().getValues()).toEqual(proposalForm.getProposalFormDefaults());
    expect(saveValuesToOda).not.toHaveBeenCalled();
  });

  test('keeps the proposal open when moving between editor pages', () => {
    const { rerenderPHT } = renderPHT();

    mockPathname.current = PATH[1];
    rerenderPHT();
    mockPathname.current = NAV[0];
    rerenderPHT();

    expect(currentForm().getValues('prslId')).toBe('prp-123');
  });

  test.each(['Latest summary before blur', '', 'word '.repeat(251).trim()])(
    'saves the current RHF abstract on navigation without blur: %s',
    async (abstract) => {
      mockOpenProposal.current = { prslId: 'prp-123', abstract: 'Saved summary' };
      mockPathname.current = NAV[2];
      const { rerenderPHT } = renderPHT();
      act(() => {
        currentForm().setValue('abstract', abstract);
      });

      mockPathname.current = NAV[1];
      rerenderPHT();

      await waitFor(() => {
        expect(saveValuesToOda).toHaveBeenCalledWith(
          expect.objectContaining({ prslId: 'prp-123', abstract }),
          PROPOSAL_STATUS.DRAFT
        );
      });
    }
  );
});

describe('<PHT /> auto-repair for a linked target with no observation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(linkTarget).mockResolvedValue();
    mockProposal.targetObservation = [];
    mockOpenProposal.current = mockProposal;
  });

  it('re-links the target as soon as the proposal loads, regardless of the current page', async () => {
    await act(async () => {
      wrapper(<PHT {...fullProps} />);
    });

    await waitFor(() => {
      expect(vi.mocked(linkTarget)).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(linkTarget)).toHaveBeenCalledWith(
      mockProposal.targets[0],
      expect.objectContaining({ getValues: expect.any(Function) }),
      null
    );
  });

  it('does not re-run auto-link when a targetObservation entry already exists', async () => {
    mockProposal.targetObservation = [
      {
        targetId: '1',
        observationId: 'obs-1',
        dataProductsSDPId: 'sdp-1',
        sensitivity: { id: 1, title: 'Target 1', state: SENSITIVITY_STATE.DONE }
      }
    ];

    await act(async () => {
      wrapper(<PHT {...fullProps} />);
    });

    expect(linkTarget).not.toHaveBeenCalled();
  });
});
