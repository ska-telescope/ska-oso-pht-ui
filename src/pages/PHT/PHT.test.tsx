import { render, waitFor, act } from '@testing-library/react';
import { beforeEach, describe, expect, test, it, vi } from 'vitest';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MemoryRouter } from 'react-router-dom';
import PHT from './PHT';
import { NAV, PATH, PROPOSAL_STATUS } from '@/utils/constants';
import PutProposal from '@/services/axios/put/putProposal/putProposal';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { SKAThemeProvider, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import autoLinking from '@/utils/autoLinking/AutoLinking';

const mockNavigate = vi.fn();
const mockSetHelp = vi.fn();
const mockPathname = { current: PATH[0] };
const mockApplicationContent2 = { current: { id: 'prsl-123' } as any };

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: mockPathname.current }),
  MemoryRouter: ({ children }: React.PropsWithChildren) => <>{children}</>,
  Routes: () => null,
  Route: () => null
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: () => true
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  StoreProvider: ({ children }: React.PropsWithChildren) => <>{children}</>,
  storageObject: {
    useStore: () => ({
      application: {
        content2: mockApplicationContent2.current,
        content5: { message: '', level: '', delay: 0 }
      },
      help: ['', '', ''],
      helpToggle: false,
      helpComponent: vi.fn(),
      helpComponentURL: vi.fn(),
      updateAppContent2: mockUpdateAppContent2,
      updateAppContent5: vi.fn()
    })
  }
}));

vi.mock('@/services/axios/put/putProposal/putProposal', () => ({
  default: vi.fn().mockResolvedValue({ id: 'prsl-123' })
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({ axiosClient: {}, refreshAuthToken: vi.fn() })
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

vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key
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

const { mockProposal, mockUpdateAppContent2 } = vi.hoisted(() => ({
  mockProposal: {
    id: 'prsl-t0001-20250101-00001',
    scienceCategory: 'continuum',
    abstract: 'Test abstract',
    targets: [{ id: 1, name: 'Target 1' }],
    observations: [] as any[],
    dataProductSDP: [] as any[],
    targetObservation: [] as any[],
    calibrationStrategy: [] as any[]
  },
  mockUpdateAppContent2: vi.fn()
}));

// PHT's own effects (specifically the auto-repair one under test) don't depend on the routed
// page - stub the default '/' route so the test doesn't have to satisfy LandingPage's own
// data-loading requirements.
vi.mock('../LandingPage/LandingPage', () => ({
  default: () => <div data-testid="landing-page-stub" />
}));

vi.mock('@/utils/autoLinking/AutoLinking', () => ({
  default: vi.fn().mockResolvedValue({ success: true })
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
    mockApplicationContent2.current = { id: 'prsl-123' };
  });

  test('renders correctly', () => {
    renderPHT();
  });

  test('auto-saves when navigating between proposal pages', async () => {
    const { rerenderPHT } = renderPHT();

    mockPathname.current = NAV[1];
    rerenderPHT();

    mockPathname.current = NAV[2];
    rerenderPHT();

    await waitFor(() => {
      expect(PutProposal).toHaveBeenCalledWith({}, { id: 'prsl-123' }, PROPOSAL_STATUS.DRAFT);
    });
  });

  test('auto-saves when navigating from proposal page to home', async () => {
    const { rerenderPHT } = renderPHT();

    mockPathname.current = NAV[3];
    rerenderPHT();

    mockPathname.current = PATH[0];
    rerenderPHT();

    await waitFor(() => {
      expect(PutProposal).toHaveBeenCalledWith({}, { id: 'prsl-123' }, PROPOSAL_STATUS.DRAFT);
    });
  });
});

describe('<PHT /> auto-repair for a linked target with no observation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(autoLinking as any).mockResolvedValue({ success: true });
    mockProposal.targetObservation = [];
    mockApplicationContent2.current = mockProposal;
  });

  it('re-runs the auto-link route as soon as the proposal loads, regardless of the current page', async () => {
    await act(async () => {
      wrapper(<PHT {...fullProps} />);
    });

    await waitFor(() => {
      expect(vi.mocked(autoLinking as any)).toHaveBeenCalledTimes(1);
    });

    expect(vi.mocked(autoLinking as any)).toHaveBeenCalledWith(
      mockProposal.targets[0],
      expect.any(Function),
      expect.any(Function),
      {},
      mockProposal.scienceCategory,
      mockProposal.abstract
    );
  });

  it('does not re-run auto-link when a targetObservation entry already exists', async () => {
    mockProposal.targetObservation = [
      {
        targetId: 1,
        observationId: 'obs-1',
        dataProductsSDPId: 'sdp-1',
        sensCalc: { id: 1, title: 'Target 1', statusGUI: 0 }
      }
    ];

    await act(async () => {
      wrapper(<PHT {...fullProps} />);
    });

    expect(vi.mocked(autoLinking as any)).not.toHaveBeenCalled();
  });
});
