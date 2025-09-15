import { describe, test, vi } from 'vitest';
import { fireEvent, screen, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import { isLoggedIn } from '@ska-telescope/ska-login-page';
import { useNavigate } from 'react-router-dom';
import LandingPage from './LandingPage';

vi.mock('@ska-telescope/ska-login-page', () => ({
  isLoggedIn: vi.fn(() => false)
}));

const mockNavigate = vi.fn();
((useNavigate as unknown) as vi.Mock).mockReturnValue(mockNavigate);

describe('<LandingPage />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <LandingPage />
      </StoreProvider>
    );
  });
});

test('creates dummy proposal when not logged in', async () => {
  (isLoggedIn as jest.Mock).mockReturnValue(false);
  render(
    <StoreProvider>
      <LandingPage />
    </StoreProvider>
  );
  expect(isLoggedIn()).toBe(false);

  fireEvent.click(screen.getByTestId('addMockButton'));

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith(expect.anything());
  });
});
