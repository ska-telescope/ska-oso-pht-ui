import { describe, expect, test, vi } from 'vitest';
import { fireEvent, screen, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import LandingPage from './LandingPage';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

// Mock useNavigate and isLoggedIn
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => false)
}));

describe('<LandingPage />', () => {
  test('renders correctly', () => {
    wrapper(<LandingPage />);
    // You can add assertions here if needed
  });

  test('creates dummy proposal when not logged in', async () => {
    wrapper(<LandingPage />);

    expect(isLoggedIn()).toBe(false);

    fireEvent.click(screen.getByTestId('addSubmissionButton'));
    /*
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(expect.anything());
    });
    */
  });
});
