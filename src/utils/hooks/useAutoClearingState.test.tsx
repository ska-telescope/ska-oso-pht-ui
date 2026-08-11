import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, vi, afterEach } from 'vitest';
import { useAutoClearingState } from './useAutoClearingState';

describe('useAutoClearingState', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test('starts at restingValue', () => {
    const { result } = renderHook(() => useAutoClearingState('', 1000));
    expect(result.current[0]).toBe('');
  });

  test('reverts to restingValue after delayMs', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAutoClearingState('', 1000));

    act(() => result.current[1]('error'));
    expect(result.current[0]).toBe('error');

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current[0]).toBe('');
  });

  test('does not schedule a timer while already at restingValue', () => {
    vi.useFakeTimers();
    renderHook(() => useAutoClearingState(true, 1000));

    // no error if this throws - just checking no stray timer needs clearing
    act(() => vi.advanceTimersByTime(1000));
    expect(vi.getTimerCount()).toBe(0);
  });

  test('setting the same non-resting value again restarts the timer', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAutoClearingState(true, 1000));

    act(() => result.current[1](false));
    act(() => vi.advanceTimersByTime(500));
    act(() => result.current[1](false));
    act(() => vi.advanceTimersByTime(500));
    expect(result.current[0]).toBe(false); // original timer's 1000ms hasn't been reached yet

    act(() => vi.advanceTimersByTime(500));
    expect(result.current[0]).toBe(true);
  });
});
