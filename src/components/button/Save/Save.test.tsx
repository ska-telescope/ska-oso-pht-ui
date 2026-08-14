import React from 'react';
import { describe, expect, test, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import SaveButton from './Save';
import '@testing-library/jest-dom';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
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

  test('passes true on auto-save and no arguments on click', () => {
    wrapper(<SaveButton action={mockAction} autoSaveInterval={2} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(mockAction).toHaveBeenCalledWith(true);

    mockAction.mockClear();
    screen.getByTestId('saveButtonTestId').click();
    expect(mockAction).toHaveBeenCalledWith();
  });

  test('fires the auto-save once per interval under StrictMode', () => {
    // The save must not be triggered from inside the setCountdown updater:
    // StrictMode double-invokes updater functions in development, and the app is
    // wrapped in StrictMode in main.tsx. Two PutProposal calls and two
    // whole-proposal store writes per tick is a dev-only bug that no other test
    // would catch.
    wrapper(
      <React.StrictMode>
        <SaveButton action={mockAction} autoSaveInterval={2} />
      </React.StrictMode>
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
    expect(mockAction).toHaveBeenCalledWith(true);
  });

  test('keeps firing on every later interval', () => {
    wrapper(<SaveButton action={mockAction} autoSaveInterval={2} />);

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(mockAction).toHaveBeenCalledTimes(3);
  });
});

describe('SaveButton iconWithCountdown', () => {
  const mockAction = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockAction.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders SaveIcon inside a Box', () => {
    const { getByTestId } = wrapper(<SaveButton action={mockAction} />);
    const btn = getByTestId('saveButtonTestId');
    expect(btn.querySelector('svg')).toBeTruthy();
  });

  it('renders CircularProgress when showCountdown and autoSaveInterval > 0', () => {
    const { container } = wrapper(
      <SaveButton action={mockAction} showCountdown autoSaveInterval={5} />
    );
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
  });

  it('does not render CircularProgress when showCountdown is false', () => {
    const { container } = wrapper(
      <SaveButton action={mockAction} showCountdown={false} autoSaveInterval={5} />
    );
    expect(container.querySelector('[role="progressbar"]')).toBeFalsy();
  });

  it('does not render CircularProgress when autoSaveInterval is 0', () => {
    const { container } = wrapper(
      <SaveButton action={mockAction} showCountdown autoSaveInterval={0} />
    );
    expect(container.querySelector('[role="progressbar"]')).toBeFalsy();
  });

  it('respects disabled prop', () => {
    wrapper(<SaveButton action={mockAction} disabled />);
    const btn = screen.getByTestId('saveButtonTestId');
    expect(btn).toBeDisabled();
  });
});
