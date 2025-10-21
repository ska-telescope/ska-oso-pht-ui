import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { useNavigate } from 'react-router-dom';
import { useMsal } from '@azure/msal-react';
import { Logger } from '@azure/msal-browser';
import { useUserGroups } from '@ska-telescope/ska-login-page';
import { IPublicClientApplication } from '@azure/msal-browser';
import ButtonUserMenu from './UserMenu';

// Mocks
vi.mock('@azure/msal-react', () => ({
  useMsal: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  ButtonLogin: () => <div data-testid="login-button">Login</div>,
  ButtonUser: (props: any) => (
    <button data-testid="user-button" onClick={props.onClick}>
      {props.label}
    </button>
  ),
  ButtonLogout: () => <div data-testid="logout-button">Logout</div>,
  useUserGroups: vi.fn()
}));

vi.mock('@/utils/constants', async () => {
  const actual = await vi.importActual<typeof import('@/utils/constants')>('@/utils/constants');
  return {
    ...actual,
    isCypress: false
  };
});

describe('UserMenu', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    localStorage.clear();

    // Set up hook return values
    vi.mocked(useMsal).mockReturnValue({
      accounts: [
        {
          name: 'TestUser',
          homeAccountId: '',
          environment: '',
          tenantId: '',
          username: '',
          localAccountId: ''
        }
      ],
      instance: {} as IPublicClientApplication,
      inProgress: 'none',
      logger: new Logger({ loggerCallback: () => {} })
    });

    vi.mocked(useUserGroups).mockReturnValue({
      hasGroup: (group: string) =>
        [
          'obs-oauth2role-opsproposaladmin-1-1535351309',
          'obs-oauth2role-opsreviewerchair-11741547065',
          'obs-oauth2role-scireviewer-1635769025'
        ].includes(group)
    });
  });

  it('renders login button when no user is present', () => {
    vi.mocked(useMsal).mockReturnValue({
      accounts: [],
      instance: {} as IPublicClientApplication,
      inProgress: 'none',
      logger: new Logger({ loggerCallback: () => {} })
    });

    render(
      <StoreProvider>
        <ButtonUserMenu />
      </StoreProvider>
    );

    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('renders user button when user is present', () => {
    render(
      <StoreProvider>
        <ButtonUserMenu />
      </StoreProvider>
    );

    expect(screen.getByTestId('user-button')).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('opens menu on user button click', () => {
    render(
      <StoreProvider>
        <ButtonUserMenu />
      </StoreProvider>
    );

    fireEvent.click(screen.getByTestId('user-button'));
    expect(screen.getByRole('menu')).toBeVisible();
  });

  it('calls onClick override if provided', () => {
    const onClick = vi.fn();

    render(
      <StoreProvider>
        <ButtonUserMenu onClick={onClick} />
      </StoreProvider>
    );

    fireEvent.click(screen.getByTestId('user-button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders reviewer menu items based on roles', () => {
    render(
      <StoreProvider>
        <ButtonUserMenu />
      </StoreProvider>
    );

    fireEvent.click(screen.getByTestId('user-button'));

    expect(screen.getByTestId('menuItemOverview')).toBeInTheDocument();
    expect(screen.getByTestId('menuItemProposals')).toBeInTheDocument();
    expect(screen.getByTestId('menuItemPanelSummary')).toBeInTheDocument();
    expect(screen.getByTestId('menuItemReviews')).toBeInTheDocument();
    expect(screen.getByTestId('menuItemReviewDecisions')).toBeInTheDocument();
    expect(screen.getByTestId('menuItemPanelLogout')).toBeInTheDocument();
  });

  it('navigates when menu item is selected', () => {
    render(
      <StoreProvider>
        <ButtonUserMenu />
      </StoreProvider>
    );

    fireEvent.click(screen.getByTestId('user-button'));
    fireEvent.click(screen.getByTestId('menuItemOverview'));
    expect(mockNavigate).toHaveBeenCalledWith('/review/proposal');
  });
});
