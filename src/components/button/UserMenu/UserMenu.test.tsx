import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import ButtonUserMenu from './UserMenu';
import { isReviewerAdmin, isReviewerChair, isReviewer } from '@/utils/aaa/aaaUtils';

// Mocks
vi.mock('@azure/msal-react', () => ({
  useMsal: vi.fn()
}));

vi.mock('react-i18next', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key
  })
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
  ButtonLogout: () => <div data-testid="logout-button">Logout</div>
}));

vi.mock('@/utils/aaa/aaaUtils', () => ({
  isReviewerAdmin: vi.fn(),
  isReviewerChair: vi.fn(),
  isReviewer: vi.fn()
}));

vi.mock('@/utils/constants', () => ({
  PMT: ['/panel-summary', '/reviews', '/overview', '/unused', '/decisions'],
  PATH: ['/proposals'],
  isCypress: false
}));

describe('UserMenu', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    localStorage.clear();
  });

  it('renders login button when no user is present', () => {
    (useMsal as any).mockReturnValue({ accounts: [] });
    render(
      <StoreProvider>
        <ButtonUserMenu />
      </StoreProvider>
    );
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('renders user button when user is present', () => {
    (useMsal as any).mockReturnValue({ accounts: [{ name: 'TestUser' }] });
    render(
      <StoreProvider>
        <ButtonUserMenu />
      </StoreProvider>
    );
    expect(screen.getByTestId('user-button')).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('opens menu on user button click', () => {
    (useMsal as any).mockReturnValue({ accounts: [{ name: 'TestUser' }] });
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
    (useMsal as any).mockReturnValue({ accounts: [{ name: 'TestUser' }] });
    render(
      <StoreProvider>
        <ButtonUserMenu onClick={onClick} />
      </StoreProvider>
    );
    fireEvent.click(screen.getByTestId('user-button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders reviewer menu items based on roles', () => {
    (useMsal as any).mockReturnValue({ accounts: [{ name: 'TestUser' }] });
    (isReviewerAdmin as any).mockReturnValue(true);
    (isReviewer as any).mockReturnValue(true);
    (isReviewerChair as any).mockReturnValue(true);

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
    (useMsal as any).mockReturnValue({ accounts: [{ name: 'TestUser' }] });
    (isReviewerAdmin as any).mockReturnValue(true);

    render(
      <StoreProvider>
        <ButtonUserMenu />
      </StoreProvider>
    );
    fireEvent.click(screen.getByTestId('user-button'));
    fireEvent.click(screen.getByTestId('menuItemOverview'));
    expect(mockNavigate).toHaveBeenCalledWith('/overview');
  });
});
