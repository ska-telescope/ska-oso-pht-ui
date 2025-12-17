// GetColorsContext.test.tsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { saveGetColors } from '@utils/storage/storage';
import { STORAGE_KEYS } from '@utils/storage/storageKeys';
import { GetColorsSettings } from '../types/colors';
import { GetColorsProvider, useGetColors } from './colorsContext';

// Mock storage functions
vi.mock('@utils/storage/storage', () => ({
  loadGetColors: vi.fn(),
  saveGetColors: vi.fn()
}));

describe('GetColorsContext', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('updates settings and calls saveGetColors', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GetColorsProvider>{children}</GetColorsProvider>
    );

    const { result } = renderHook(() => useGetColors(), { wrapper });

    const newSettings: GetColorsSettings = {
      version: 1,
      paletteName: '',
      contrast: 'high',
      colorBlindMode: 'none'
    };

    act(() => {
      result.current.setSettings(newSettings);
    });

    expect(result.current.settings).toEqual(newSettings);
    expect(saveGetColors).toHaveBeenCalledWith(newSettings);
  });

  it('reacts to storage events with valid data', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GetColorsProvider>{children}</GetColorsProvider>
    );

    const { result } = renderHook(() => useGetColors(), { wrapper });

    const updatedSettings: GetColorsSettings = {
      version: 1,
      paletteName: '',
      contrast: 'high',
      colorBlindMode: 'none'
    };

    act(() => {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEYS.appColors,
          newValue: JSON.stringify(updatedSettings)
        })
      );
    });

    expect(result.current.settings).toEqual(updatedSettings);
  });

  it('throws error if used outside provider', () => {
    expect(() => renderHook(() => useGetColors())).toThrowError(
      'useGetColors must be used within GetColorsProvider'
    );
  });
});
