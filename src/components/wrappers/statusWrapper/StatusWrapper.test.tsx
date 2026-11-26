import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import StatusWrapper from './StatusWrapper';
import { NAV, PATH, STATUS_ERROR } from '@/utils/constants';

const mockPathname = vi.hoisted(() => ({ current: '' }));
vi.mock('react-router', async () => ({
  ...(await vi.importActual('react-router')),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: mockPathname.current })
}));
vi.mock('@ska-telescope/ska-login-page', () => ({ isLoggedIn: () => true }));

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<StatusWrapper />', () => {
  test('renders correctly ( default )', () => {
    wrapper(<StatusWrapper page={1} />);
  });
  test('renders correctly ( STATUS_ERROR  )', () => {
    wrapper(<StatusWrapper page={1} level={STATUS_ERROR} />);
  });
  test('renders correctly ( 7 )', () => {
    wrapper(<StatusWrapper page={1} level={7} />);
  });

  // A new proposal isn't created in the backend yet, so only its Title page can be opened
  test.each([
    ['on the Add proposal page', PATH[1], true],
    ['on a proposal page', NAV[1], false]
  ])('disables the other pages %s: %s', (_, pathname, disabled) => {
    mockPathname.current = pathname;
    wrapper(<StatusWrapper page={4} />);
    const icon = screen.getByRole('button', { name: 'Page Status' });
    if (disabled) {
      expect(icon).toBeDisabled();
    } else {
      expect(icon).toBeEnabled();
    }
  });
});
