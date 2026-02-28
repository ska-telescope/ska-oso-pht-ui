import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOSDAccessors } from './useOSDAccessors';

import { storageObject } from '@ska-telescope/ska-gui-local-storage';
import { useOSD } from '../useOSD/useOSD';

import { BAND_LOW_STR, TELESCOPE_LOW_NUM, TELESCOPE_MID_NUM } from '@/utils/constants';

// ----------------------
// MOCKS
// ----------------------

vi.mock('../useOSD/useOSD');
vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: vi.fn()
  }
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: vi.fn((key, vars) => `${key} ${JSON.stringify(vars ?? {})}`)
  })
}));

// ----------------------
// FIXED TIME FOR COUNTDOWN
// ----------------------
const FIXED_NOW = new Date('2025-01-01T12:00:00Z');

describe('useOSDAccessors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);

    (useOSD as vi.Mock).mockReturnValue({
      capabilities: {
        low: { basicCapabilities: { lowValue: 1 } },
        mid: {
          basicCapabilities: {
            receiverInformation: [{ rxId: 'MID1', value: 123 }]
          }
        }
      },
      policies: [
        {
          type: 'Science Verification',
          cycleInformation: {
            cycleId: 'C1',
            proposalOpen: '20250101T000000',
            proposalClose: '20250102T000000'
          },
          cyclePolicies: {
            low: ['custom'],
            mid: [],
            maxTargets: 1,
            maxObservations: 1
          },
          cycleDescription: 'Cycle 1 description'
        }
      ]
    });

    (storageObject.useStore as vi.Mock).mockReturnValue({
      application: {
        content8: [
          {
            type: 'Science Verification',
            cycleDescription: 'Cycle 1 description',
            cycleInformation: {
              cycleId: 'C1',
              proposalOpen: '20250101T000000',
              proposalClose: '20250102T000000'
            },
            cyclePolicies: {
              low: ['custom'],
              mid: [],
              maxTargets: 1,
              maxObservations: 1
            }
          }
        ]
      },
      updateAppContent8: vi.fn()
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ----------------------
  // BASIC SHAPE
  // ----------------------
  it('returns all expected accessors', () => {
    const { result } = renderHook(() => useOSDAccessors());

    expect(result.current.osdPolicies.length).toBe(1);
    expect(result.current.selectedPolicy).toBeTruthy();
    expect(result.current.selectedCycleId).toBe('C1');
    // expect(result.current.osdCapabilities.low.basicCapabilities.lowValue).toBe(1);
    expect(result.current.osdCycleDescription).toBe('Cycle 1 description');
  });

  // ----------------------
  // CYCLE DATE PRESENTATION
  // ----------------------
  it('formats opens/closes correctly', () => {
    const { result } = renderHook(() => useOSDAccessors());

    const opens = result.current.osdOpens(false);
    const closes = result.current.osdCloses(false);

    expect(opens).toContain('2025-01-01');
    expect(closes).toContain('2025-01-02');
  });

  // ----------------------
  // COUNTDOWN
  // ----------------------
  it('computes countdown correctly', () => {
    const { result } = renderHook(() => useOSDAccessors());

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.osdCountdown).toContain('cycleCloses.countdown');
  });

  // ----------------------
  // isCustomAllowed
  // ----------------------
  it('detects custom allowed for LOW', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.isCustomAllowed(TELESCOPE_LOW_NUM)).toBe(true);
  });

  it('detects custom NOT allowed for MID', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.isCustomAllowed(TELESCOPE_MID_NUM)).toBe(false);
  });

  // ----------------------
  // telescopeBand
  // ----------------------
  it('maps LOW band to telescope number', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.telescopeBand(BAND_LOW_STR)).toBe(TELESCOPE_LOW_NUM);
  });

  it('maps MID band to telescope number', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.telescopeBand('MID')).toBe(TELESCOPE_MID_NUM);
  });

  // ----------------------
  // findBand
  // ----------------------
  it('finds LOW band basic capabilities', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.findBand(BAND_LOW_STR)).toEqual({ lowValue: 1 });
  });

  it('finds MID receiverInformation entry', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.findBand('MID1')).toEqual({ rxId: 'MID1', value: 123 });
  });

  // ----------------------
  // isSV
  // ----------------------
  it('detects Science Verification mode', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.isSV).toBe(true);
  });

  // ----------------------
  // autoLink
  // ----------------------
  it('detects autoLink when maxTargets=1 and maxObservations=1', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.autoLink).toBe(true);
  });

  // ----------------------
  // setSelectedPolicyByCycleId
  // ----------------------
  it('auto-selects active cycle when no selectedPolicy exists', () => {
    const updateMock = vi.fn();

    (storageObject.useStore as vi.Mock).mockReturnValue({
      application: { content8: null }, // <-- key fix
      updateAppContent8: updateMock
    });

    (useOSD as vi.Mock).mockReturnValue({
      capabilities: {},
      policies: [
        {
          type: 'Science Verification',
          cycleInformation: {
            cycleId: 'C1',
            proposalOpen: '20250101T000000',
            proposalClose: '20250102T000000'
          },
          cyclePolicies: {}
        }
      ]
    });

    renderHook(() => useOSDAccessors());

    expect(updateMock).toHaveBeenCalledTimes(1);
  });
});
