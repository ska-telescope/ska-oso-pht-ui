import { describe, test, it, vi, expect, beforeEach } from 'vitest';
import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PHT from './PHT';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { SKAThemeProvider, THEME_LIGHT } from '@ska-telescope/ska-gui-components';
import autoLinking from '@/utils/autoLinking/AutoLinking';

const wrapper = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <ThemeA11yProvider>
        {' '}
        <SKAThemeProvider themeMode={THEME_LIGHT} accessibilityMode={0}>
          {component}
        </SKAThemeProvider>
      </ThemeA11yProvider>
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

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    autoLink: true,
    osdCloses: () => '',
    osdCountdown: '',
    osdCycleId: 'CYCLE-1',
    osdCycleDescription: '',
    osdOpens: () => ''
  })
}));

vi.mock('@/utils/autoLinking/AutoLinking', () => ({
  default: vi.fn().mockResolvedValue({ success: true })
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content2: mockProposal,
        content5: {}
      },
      help: false,
      helpToggle: vi.fn(),
      helpComponent: vi.fn(),
      helpComponentURL: vi.fn(),
      updateAppContent2: mockUpdateAppContent2,
      updateAppContent5: vi.fn()
    })
  },
  StoreProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('<PHT />', () => {
  test('renders correctly', () => {
    wrapper(
      <PHT
        themeMode={''}
        setThemeMode={function (_mode: string): void {
          throw new Error('Function not implemented.');
        }}
        accessibilityMode={0}
        setAccessibilityMode={function (_mode: number): void {
          throw new Error('Function not implemented.');
        }}
      />
    );
  });
});

describe('<PHT /> auto-repair for a linked target with no observation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(autoLinking as any).mockResolvedValue({ success: true });
    mockProposal.targetObservation = [];
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
