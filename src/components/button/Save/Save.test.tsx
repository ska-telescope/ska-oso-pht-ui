import React from 'react';
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
