import { describe, expect, test, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SaveButton from './Save';
import '@testing-library/jest-dom';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';
import '@testing-library/jest-dom';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <AppFlowProvider>{component}</AppFlowProvider>
    </StoreProvider>
  );
};

describe('Save Button', () => {
  const mockAction = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockAction.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
  test('renders correctly', () => {
    wrapper(<SaveButton action={mockAction} />);
    expect(screen.getByTestId('saveButtonTestId')).toHaveTextContent('saveBtn.label');
    screen.getByTestId('saveButtonTestId').click();
    expect(mockAction).toBeCalled();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<SaveButton action={mockAction} toolTip="" />);
    expect(screen.getByTestId('saveButtonTestId')).toHaveTextContent('saveBtn.label');
  });

  test('does not trigger auto-save if action is not a function', () => {
    wrapper(<SaveButton action="notAFunction" autoSaveInterval={2} showCountdown />);
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    // Should not throw or call anything
    expect(mockAction).not.toHaveBeenCalled();
  });
});
