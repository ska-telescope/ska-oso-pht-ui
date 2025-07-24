import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ButtonUserMenu from '././UserMenu';
import '@testing-library/jest-dom';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('ButtonUserMenu', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <MockedLoginProvider>
        <ButtonUserMenu onClick={mockAction} />
      </MockedLoginProvider>
    );
    expect(screen.getByTestId('usernameMenu')).toHaveTextContent('Mocked');
    screen.getByTestId('usernameMenu').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <MockedLoginProvider>
        <ButtonUserMenu onClick={mockAction} toolTip="" />
      </MockedLoginProvider>
    );
    expect(screen.getByTestId('usernameMenu')).toHaveTextContent('Mocked');
  });
});
