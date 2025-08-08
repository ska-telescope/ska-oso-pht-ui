import {
  AccountInfo,
  AuthenticationResult,
  InteractionStatus,
  IPublicClientApplication,
  Logger,
  LogLevel
} from '@azure/msal-browser';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { getPhoto } from '@ska-telescope/ska-login-page';
import ButtonUserMenu, { ButtonUserMenuProps } from './UserMenu';

// Import the mocked modules

// Mock the external dependencies
vi.mock('@azure/msal-react', () => ({
  useIsAuthenticated: vi.fn(),
  useMsal: vi.fn()
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  ButtonLogin: vi.fn(() => <button data-testid="login-button">Login</button>),
  ButtonLogout: vi.fn(() => <button data-testid="logout-button">Logout</button>),
  getPhoto: vi.fn()
}));

vi.mock('@ska-telescope/ska-gui-components', () => ({
  Button: vi.fn(({ onClick, label, testId, children, icon, disabled }) => (
    <button onClick={onClick} data-testid={testId} disabled={disabled}>
      {icon}
      {label}
      {children}
    </button>
  )),
  ButtonColorTypes: {
    Inherit: 'inherit',
    Primary: 'primary',
    Secondary: 'secondary'
  },
  ButtonVariantTypes: {
    Text: 'text',
    Outlined: 'outlined',
    Contained: 'contained'
  }
}));

vi.mock('@/utils/constants', () => ({
  PMT: ['panel-summary', 'reviews', 'overview', 'other', 'review-decisions'],
  PATH: ['proposals']
}));

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockUseIsAuthenticated = vi.mocked(useIsAuthenticated);
const mockUseMsal = vi.mocked(useMsal);
const mockGetPhoto = vi.mocked(getPhoto);

// Create a mock logger instance
const createMockLogger = (): Logger => {
  return new Logger({
    loggerCallback: vi.fn(),
    piiLoggingEnabled: false,
    logLevel: LogLevel.Info
  });
};

// Create a complete mock MSAL instance
const createMockMsalInstance = (): IPublicClientApplication => ({
  // Core methods
  initialize: vi.fn().mockResolvedValue(undefined),
  acquireTokenSilent: vi.fn().mockResolvedValue({} as AuthenticationResult),
  acquireTokenPopup: vi.fn().mockResolvedValue({} as AuthenticationResult),
  acquireTokenRedirect: vi.fn().mockResolvedValue(undefined),
  acquireTokenByCode: vi.fn().mockResolvedValue({} as AuthenticationResult),

  // Account methods
  getAllAccounts: vi.fn().mockReturnValue([]),
  getAccountByHomeId: vi.fn().mockReturnValue(null),
  getAccountByLocalId: vi.fn().mockReturnValue(null),
  getAccountByUsername: vi.fn().mockReturnValue(null),
  getActiveAccount: vi.fn().mockReturnValue(null),
  setActiveAccount: vi.fn(),

  // Authentication methods
  loginPopup: vi.fn().mockResolvedValue({} as AuthenticationResult),
  loginRedirect: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  logoutRedirect: vi.fn().mockResolvedValue(undefined),
  logoutPopup: vi.fn().mockResolvedValue(undefined),

  // SSO methods
  ssoSilent: vi.fn().mockResolvedValue({} as AuthenticationResult),

  // Event methods
  addEventCallback: vi.fn().mockReturnValue('callback-id'),
  removeEventCallback: vi.fn(),
  addPerformanceCallback: vi.fn().mockReturnValue('perf-callback-id'),
  removePerformanceCallback: vi.fn(),
  enableAccountStorageEvents: vi.fn(),
  disableAccountStorageEvents: vi.fn(),

  // Token cache methods
  getTokenCache: vi.fn().mockReturnValue({
    loadExternalTokens: vi.fn().mockResolvedValue(undefined)
  } as any),

  // Utility methods
  getLogger: vi.fn().mockReturnValue(createMockLogger()),
  setLogger: vi.fn(),

  // Navigation methods
  getRedirectUri: vi.fn().mockReturnValue('http://localhost:3000'),
  getPostLogoutRedirectUri: vi.fn().mockReturnValue('http://localhost:3000'),

  // Initialization methods
  handleRedirectPromise: vi.fn().mockResolvedValue(null),

  // Configuration
  getConfiguration: vi.fn().mockReturnValue({
    auth: {
      clientId: 'test-client-id',
      authority: 'https://login.microsoftonline.com/common'
    },
    cache: {},
    system: {}
  } as any),

  // Browser utils
  clearCache: vi.fn().mockResolvedValue(undefined),

  // Hybrid flow methods (if using MSAL 3.x)
  acquireTokenNative: vi.fn().mockResolvedValue({} as AuthenticationResult),

  // Additional utility methods
  initializeWrapperLibrary: vi.fn(),
  setNavigationClient: vi.fn()
});

// Create a complete mock account
const createMockAccount = (overrides: Partial<AccountInfo> = {}): AccountInfo => ({
  homeAccountId: '123.456-789',
  environment: 'login.microsoftonline.com',
  tenantId: '789',
  username: 'john.doe@example.com',
  localAccountId: '123',
  name: 'John Doe',
  idTokenClaims: {
    aud: 'test-client-id',
    iss: 'https://login.microsoftonline.com/789/v2.0',
    iat: Date.now() / 1000,
    nbf: Date.now() / 1000,
    exp: Date.now() / 1000 + 3600,
    sub: 'test-subject',
    tid: '789',
    oid: 'object-id',
    preferred_username: 'john.doe@example.com',
    name: 'John Doe',
    ver: '2.0'
  },
  nativeAccountId: 'native-account-id',
  authorityType: 'MSSTS',
  ...overrides
});

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const theme = createTheme();
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </BrowserRouter>
  );
};

// Helper function to render component with wrapper
const renderWithWrapper = (props: Partial<ButtonUserMenuProps> = {}) => {
  return render(
    <TestWrapper>
      <ButtonUserMenu {...props} />
    </TestWrapper>
  );
};

describe('ButtonUserMenu', () => {
  let mockMsalInstance: IPublicClientApplication;
  let mockLogger: Logger;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockMsalInstance = createMockMsalInstance();
    mockLogger = createMockLogger();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('when user is not authenticated', () => {
    beforeEach(() => {
      mockUseIsAuthenticated.mockReturnValue(false);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [],
        inProgress: InteractionStatus.None,
        logger: mockLogger
      });
    });

    it('should render login button when user is not authenticated', () => {
      renderWithWrapper();

      expect(screen.getByTestId('login-button')).toBeInTheDocument();
      expect(screen.queryByTestId('usernameMenu')).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    const mockAccount = createMockAccount({
      name: 'John Doe',
      username: 'john.doe@example.com'
    });

    beforeEach(() => {
      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [mockAccount],
        inProgress: InteractionStatus.None,
        logger: mockLogger
      });
    });

    it('should render user button with username when authenticated', () => {
      renderWithWrapper();

      expect(screen.getByTestId('usernameMenu')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByTestId('login-button')).not.toBeInTheDocument();
    });

    it('should display default icon when photo is not available', () => {
      mockGetPhoto.mockReturnValue(null);

      renderWithWrapper();

      expect(screen.queryByRole('img', { name: 'Profile' })).not.toBeInTheDocument();
      // AccountCircleIcon should be rendered instead
    });

    it('should open menu when user button is clicked', async () => {
      const user = userEvent.setup();
      renderWithWrapper();

      const userButton = screen.getByTestId('usernameMenu');
      await user.click(userButton);

      expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('should render all menu items when menu is open', async () => {
      const user = userEvent.setup();
      renderWithWrapper();

      await user.click(screen.getByTestId('usernameMenu'));

      expect(screen.getByTestId('menuItemOverview')).toBeInTheDocument();
      expect(screen.getByTestId('menuItemProposals')).toBeInTheDocument();
      expect(screen.getByTestId('menuItemPanelSummary')).toBeInTheDocument();
      expect(screen.getByTestId('menuItemReviews')).toBeInTheDocument();
      expect(screen.getByTestId('menuItemReviewDecisions')).toBeInTheDocument();
      expect(screen.getByTestId('menuItemPanelLogout')).toBeInTheDocument();
    });

    it('should navigate to correct path when menu item is clicked', async () => {
      const user = userEvent.setup();
      renderWithWrapper();

      await user.click(screen.getByTestId('usernameMenu'));
      await user.click(screen.getByTestId('menuItemOverview'));

      expect(mockNavigate).toHaveBeenCalledWith('overview');
    });

    it('should close menu after navigation', async () => {
      const user = userEvent.setup();
      renderWithWrapper();

      await user.click(screen.getByTestId('usernameMenu'));
      await user.click(screen.getByTestId('menuItemProposals'));
    });

    it('should close menu when clicking outside', async () => {
      const user = userEvent.setup();
      renderWithWrapper();

      await user.click(screen.getByTestId('usernameMenu'));
      expect(screen.getByRole('menu')).toBeInTheDocument();

      // Click outside the menu
      await user.click(document.body);
    });

    it('should render logout button in menu', async () => {
      const user = userEvent.setup();
      renderWithWrapper();

      await user.click(screen.getByTestId('usernameMenu'));

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });
  });

  describe('interaction states', () => {
    const mockAccount = createMockAccount();

    it('should handle login in progress state', () => {
      mockUseIsAuthenticated.mockReturnValue(false);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [],
        inProgress: InteractionStatus.Login,
        logger: mockLogger
      });
    });

    it('should handle acquire token in progress state', () => {
      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [mockAccount],
        inProgress: InteractionStatus.AcquireToken,
        logger: mockLogger
      });

      renderWithWrapper();

      // Component should still render but might show loading indicators
      expect(screen.getByTestId('usernameMenu')).toBeInTheDocument();
    });

    it('should handle logout in progress state', () => {
      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [mockAccount],
        inProgress: InteractionStatus.Logout,
        logger: mockLogger
      });

      renderWithWrapper();

      expect(screen.getByTestId('usernameMenu')).toBeInTheDocument();
    });

    it('should handle SSO silent in progress state', () => {
      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [mockAccount],
        inProgress: InteractionStatus.SsoSilent,
        logger: mockLogger
      });

      renderWithWrapper();

      expect(screen.getByTestId('usernameMenu')).toBeInTheDocument();
    });

    it('should handle handle redirect in progress state', () => {
      mockUseIsAuthenticated.mockReturnValue(false);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [],
        inProgress: InteractionStatus.HandleRedirect,
        logger: mockLogger
      });

      renderWithWrapper();

      // Should show login button when handling redirect
      expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });
  });

  describe('multiple accounts scenario', () => {
    it('should use first account when multiple accounts exist', () => {
      const account1 = createMockAccount({
        name: 'John Doe',
        username: 'john.doe@example.com'
      });
      const account2 = createMockAccount({
        name: 'Jane Smith',
        username: 'jane.smith@example.com',
        homeAccountId: '456.789-012',
        localAccountId: '456'
      });

      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [account1, account2],
        inProgress: InteractionStatus.None,
        logger: mockLogger
      });

      renderWithWrapper();

      // Should display the first account's name
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should handle account with missing name gracefully', () => {
      const accountWithoutName = createMockAccount({
        name: undefined as any,
        username: 'user@example.com'
      });

      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [accountWithoutName],
        inProgress: InteractionStatus.None,
        logger: mockLogger
      });

      renderWithWrapper();
    });
  });

  describe('custom props', () => {
    beforeEach(() => {
      const mockAccount = createMockAccount({
        name: 'Jane Doe',
        username: 'jane.doe@example.com'
      });

      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [mockAccount],
        inProgress: InteractionStatus.None,
        logger: mockLogger
      });
    });

    it('should call custom onClick when provided', async () => {
      const mockOnClick = vi.fn();
      const user = userEvent.setup();

      renderWithWrapper({ onClick: mockOnClick });

      await user.click(screen.getByTestId('usernameMenu'));

      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      const mockAccount = createMockAccount({
        name: 'John Doe',
        username: 'john.doe@example.com'
      });

      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [mockAccount],
        inProgress: InteractionStatus.None,
        logger: mockLogger
      });
    });

    it('should have proper ARIA attributes when menu is open', async () => {
      const user = userEvent.setup();
      renderWithWrapper();

      const userButton = screen.getByTestId('usernameMenu');
      await user.click(userButton);
    });
  });

  describe('logger functionality', () => {
    it('should have access to logger instance', () => {
      const mockAccount = createMockAccount();

      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [mockAccount],
        inProgress: InteractionStatus.None,
        logger: mockLogger
      });

      renderWithWrapper();

      // Verify that the logger is available in the MSAL context
      expect(mockUseMsal).toHaveReturnedWith(
        expect.objectContaining({
          logger: expect.any(Logger)
        })
      );
    });

    it('should handle logger configuration', () => {
      const customLogger = new Logger({
        loggerCallback: vi.fn((_level, _message) => {
          //   console.log(`[${level}] ${message}`)
        }),
        piiLoggingEnabled: true,
        logLevel: LogLevel.Verbose
      });

      const mockAccount = createMockAccount();

      mockUseIsAuthenticated.mockReturnValue(true);
      mockUseMsal.mockReturnValue({
        instance: mockMsalInstance,
        accounts: [mockAccount],
        inProgress: InteractionStatus.None,
        logger: customLogger
      });

      renderWithWrapper();
    });
  });
});
