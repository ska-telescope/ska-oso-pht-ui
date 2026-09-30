import { describe, test, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useObservationTypeOptions } from './useObservationTypeOptions';

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdLOW: { subArrays: [{ subArray: 'AA2', cbfModes: ['vis', 'pst'] }] },
    osdMID: { subArrays: [{ subArray: 'AA2', cbfModes: ['pst'] }] }
  })
}));

describe('useObservationTypeOptions', () => {
  test('returns translated options for the LOW subarray cbfModes', () => {
    const { result } = renderHook(() => useObservationTypeOptions('AA2', true));
    expect(result.current).toEqual([
      { label: 'observationType.continuum', value: 'continuum' },
      { label: 'observationType.spectral', value: 'spectral' },
      { label: 'observationType.continuumSpectral', value: 'continuumSpectral' },
      { label: 'observationType.pst', value: 'pst' }
    ]);
  });

  test('returns options for the MID subarray cbfModes', () => {
    const { result } = renderHook(() => useObservationTypeOptions('AA2', false));
    expect(result.current).toEqual([{ label: 'observationType.pst', value: 'pst' }]);
  });

  test('returns no options for an unknown subarray', () => {
    const { result } = renderHook(() => useObservationTypeOptions('unknown', true));
    expect(result.current).toEqual([]);
  });
});
