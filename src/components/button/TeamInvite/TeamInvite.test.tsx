import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TeamInviteButton from './TeamInvite';
import '@testing-library/jest-dom';

describe('TeamInvite Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TeamInviteButton action={mockAction} />
      </StoreProvider>
    );
    expect(screen.getByTestId('investigatorInviteButtonTestId')).toHaveTextContent(
      'sendInviteBtn.label'
    );
    screen.getByTestId('investigatorInviteButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <TeamInviteButton action={mockAction} toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('investigatorInviteButtonTestId')).toHaveTextContent(
      'sendInviteBtn.label'
    );
  });
});
