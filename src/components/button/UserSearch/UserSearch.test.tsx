import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserSearchButton from './UserSearch';
import '@testing-library/jest-dom';

describe('<UserSearchButton />', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<UserSearchButton action={mockAction} />);
    expect(screen.getByTestId('investigatorSearchButtonTestId')).toHaveTextContent(
      'searchForMember.label'
    );
    screen.getByTestId('investigatorSearchButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<UserSearchButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('investigatorSearchButtonTestId')).toHaveTextContent(
      'searchForMember.label'
    );
  });
});
