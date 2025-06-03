import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TeamInviteButton from './TeamInvite';
import '@testing-library/jest-dom';

describe('TeamInvite Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    render(<TeamInviteButton action={mockAction} />);
    expect(screen.getByTestId('teamInviteButtonTestId')).toHaveTextContent('button.sendInvite');
    screen.getByTestId('teamInviteButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    render(<TeamInviteButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('teamInviteButtonTestId')).toHaveTextContent('button.sendInvite');
  });
});
