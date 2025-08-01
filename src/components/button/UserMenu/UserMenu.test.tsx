import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ButtonUserMenu from '././UserMenu';
import '@testing-library/jest-dom';

describe('ButtonUserMenu', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<ButtonUserMenu onClick={mockAction} />);
    expect(screen.getByTestId('loginButton')).toHaveTextContent('Sign In');
    screen.getByTestId('loginButton').click();
    // expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<ButtonUserMenu onClick={mockAction} toolTip="" />);
    expect(screen.getByTestId('loginButton')).toHaveTextContent('Sign In');
  });
});
