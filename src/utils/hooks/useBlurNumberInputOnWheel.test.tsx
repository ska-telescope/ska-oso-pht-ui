import { renderHook } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useBlurNumberInputOnWheel } from './useBlurNumberInputOnWheel';

const dispatchWheel = () => document.dispatchEvent(new Event('wheel', { bubbles: true }));

describe('useBlurNumberInputOnWheel', () => {
  test('blurs a focused number input on wheel', () => {
    const input = document.createElement('input');
    input.type = 'number';
    document.body.appendChild(input);
    input.focus();
    expect(document.activeElement).toBe(input);

    renderHook(() => useBlurNumberInputOnWheel());
    dispatchWheel();

    expect(document.activeElement).not.toBe(input);
    document.body.removeChild(input);
  });

  test('leaves a focused text input alone', () => {
    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);
    input.focus();

    renderHook(() => useBlurNumberInputOnWheel());
    dispatchWheel();

    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });

  test('does nothing when nothing is focused', () => {
    renderHook(() => useBlurNumberInputOnWheel());
    expect(() => dispatchWheel()).not.toThrow();
  });

  test('removes the listener on unmount', () => {
    const input = document.createElement('input');
    input.type = 'number';
    document.body.appendChild(input);

    const { unmount } = renderHook(() => useBlurNumberInputOnWheel());
    unmount();
    input.focus();
    dispatchWheel();

    expect(document.activeElement).toBe(input);
    document.body.removeChild(input);
  });
});
