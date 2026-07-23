import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { MemoryRouter } from 'react-router-dom';
import PHT from './PHT';
import { NAV, PATH, PROPOSAL_STATUS } from '@/utils/constants';
import PutProposal from '@/services/axios/put/putProposal/putProposal';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';
import { SKAThemeProvider, THEME_LIGHT } from '@ska-telescope/ska-gui-components';

const mockNavigate = vi.fn();
const mockSetHelp = vi.fn();
const mockPathname = { current: PATH[0] };

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
        content2: { id: 'prsl-123' },
        content5: { message: '', level: '', delay: 0 }
      },
      help: ['', '', ''],
      helpToggle: false
    })
  }
}));

vi.mock('@/services/axios/put/putProposal/putProposal', () => ({
  default: vi.fn().mockResolvedValue({ id: 'prsl-123' })
}));

vi.mock('@/services/axios/axiosAuthClient/axiosAuthClient', () => ({
  default: () => ({})
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
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
      expect(PutProposal).toHaveBeenCalledWith(
        {},
        { id: 'prsl-123' },
        false,
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
      expect(PutProposal).toHaveBeenCalledWith(
        {},
        { id: 'prsl-123' },
        false,
        PROPOSAL_STATUS.DRAFT
      );
    });
  });
});
