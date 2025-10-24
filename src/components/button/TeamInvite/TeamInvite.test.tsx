import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import TeamInviteButton from './TeamInvite';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('TeamInvite Button', () => {
  const mockAction = vi.fn();
  test('renders correctly', () => {
    wrapper(<TeamInviteButton action={mockAction} />);
    expect(screen.getByTestId('investigatorInviteButtonTestId')).toHaveTextContent(
      'sendInviteBtn.label'
    );
    screen.getByTestId('investigatorInviteButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<TeamInviteButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('investigatorInviteButtonTestId')).toHaveTextContent(
      'sendInviteBtn.label'
    );
  });
});
