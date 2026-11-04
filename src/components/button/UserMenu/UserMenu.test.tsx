import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import { useNavigate } from 'react-router';
import { useMsal } from '@azure/msal-react';
import { Logger } from '@azure/msal-browser';
import { useUserGroups } from '@ska-telescope/ska-login-page';
import { IPublicClientApplication } from '@azure/msal-browser';
import ButtonUserMenu from './UserMenu';

const mockInstance = {
  addEventCallback: vi.fn().mockReturnValue('mock-callback-id'),
  removeEventCallback: vi.fn(),
  getAllAccounts: vi.fn().mockReturnValue([])
} as unknown as IPublicClientApplication;

// Mocks
vi.mock('@azure/msal-react', () => ({
  useMsal: vi.fn()
}));

vi.mock('react-router', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  ButtonLogin: () => (
    <div>
      <button>Login</button>
    </div>
  ),
  ButtonUser: (props: any) => <button onClick={props.onClick}>{props.label}</button>,
  ButtonLogout: () => <div>Logout</div>,
  useUserGroups: vi.fn()
}));

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('UserMenu', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as any).mockReturnValue(mockNavigate);
    localStorage.clear();

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
      instance: mockInstance,
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
      instance: mockInstance,
      inProgress: 'none',
      logger: new Logger({ loggerCallback: () => {} })
    });

    wrapper(<ButtonUserMenu />);
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('renders user button when user is present', () => {
    wrapper(<ButtonUserMenu />);
    expect(screen.getByRole('button', { name: 'TestUser' })).toBeInTheDocument();
    expect(screen.getByText('TestUser')).toBeInTheDocument();
  });

  it('opens menu on user button click', () => {
    wrapper(<ButtonUserMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'TestUser' }));
    expect(screen.getByRole('menu')).toBeVisible();
  });

  it('calls onClick override if provided', () => {
    const onClick = vi.fn();
    wrapper(<ButtonUserMenu onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'TestUser' }));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders reviewer menu items based on roles', () => {
    wrapper(<ButtonUserMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'TestUser' }));
    for (const item of [
      'overview.title',
      'homeBtn.title',
      'page.16.title',
      'reviewProposalList.short',
      'reviewDecisionsList.title',
      'Logout'
    ]) {
      expect(screen.getByRole('menuitem', { name: item })).toBeInTheDocument();
    }
  });

  it('navigates when menu item is selected', () => {
    wrapper(<ButtonUserMenu />);
    fireEvent.click(screen.getByRole('button', { name: 'TestUser' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'overview.title' }));
    expect(mockNavigate).toHaveBeenCalledWith('/review/proposal');
  });

  it('navigates to home page when login button is clicked', () => {
    vi.mocked(useMsal).mockReturnValue({
      accounts: [],
      instance: mockInstance,
      inProgress: 'none',
      logger: new Logger({ loggerCallback: () => {} })
    });

    wrapper(<ButtonUserMenu />);
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
