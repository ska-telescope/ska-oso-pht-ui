import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOSDAccessors } from './useOSDAccessors';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, any>) => {
      if (key === 'cycleCloses.countdown') {
        const { days, hours, minutes, seconds } = vars || {};
        return `Cycle closes in ${days}d ${hours}h ${minutes}m ${seconds}s`;
      }
      return key;
    }
  })
}));

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content3: {
          capabilities: {
            low: {
              basicCapabilities: {
                minFrequencyHz: 50,
                maxFrequencyHz: 350
              },
              AA2: {
                availableBandwidthHz: 1000000,
                numberStations: 256,
                numberSubstations: 64,
                maxBaselineKm: 65,
                cbfModes: ['modeA'],
                numberZoomWindows: 4,
                numberZoomChannels: 1024,
                numberPssBeams: 8,
                numberPstBeams: 4,
                psBeamBandwidthHz: 500000,
                numberFsps: 2,
                channelWidthHz: 1000,
                numberBeams: 16,
                numberVlbiBeams: 2
              }
            },
            mid: {
              basicCapabilities: {
                dishElevationLimitDeg: 15,
                receiverInformation: [
                  {
                    rxId: 'B1',
                    minFrequencyHz: 350,
                    maxFrequencyHz: 1050
                  }
                ]
              },
              AA2: {
                availableReceivers: ['B1'],
                numberSkaDishes: 64,
                numberMeerkatDishes: 32,
                numberMeerkatPlusDishes: 16,
                numberChannels: 4096,
                maxBaselineKm: 150,
                availableBandwidthHz: 2000000,
                cbfModes: ['modeX'],
                numberZoomWindows: 6,
                numberZoomChannels: 2048,
                numberPssBeams: 12,
                numberPstBeams: 6,
                psBeamBandwidthHz: 1000000,
                numberFsps: 4
              }
            }
          },
          observatoryPolicy: {
            cycleNumber: 42,
            cycleDescription: 'Cycle 42',
            cycleInformation: {
              cycleId: 'CYCLE-ID-2025',
              proposalOpen: '20250901T08:00:00',
              proposalClose: '20250930T12:00:00'
            },
            cyclePolicies: {
              normalMaxHours: 100
            },
            telescopeCapabilities: {
              mid: 'MID Telescope Description',
              low: 'LOW Telescope Description'
            }
          }
        }
      }
    })
  }
}));

vi.mock('../../present/present', () => ({
  presentDate: (ts: string) => `date(${ts})`,
  presentTime: (ts: string) => `time(${ts})`
}));

describe('useOSDAccessors hook', () => {
  it('returns expected low and mid capabilities', () => {
    const { result } = renderHook(() => useOSDAccessors());
    expect(result.current.osdLOW?.basicCapabilities.minFrequencyHz).toBe(50);
    expect(result.current.osdMID?.basicCapabilities.dishElevationLimitDeg).toBe(15);
  });

  // TODO : Will need to revisit this

  // it('returns cycle ID and description', () => {
  //   const { result } = renderHook(() => useOSDAccessors());
  //   // expect(result.current.osdCycleId).toBe('CYCLE-ID-2025');
  //   // expect(result.current.osdCycleDescription).toBe('Cycle 42');
  // });

  // it('returns formatted proposal close date', () => {
  //   const { result } = renderHook(() => useOSDAccessors());
  //   expect(result.current.osdCloses(false)).toBe('2025-09-30T12:00:00');
  //   expect(result.current.osdCloses(true)).toBe(
  //     'date(2025-09-30T12:00:00) time(2025-09-30T12:00:00)'
  //   );
  // });

  // it('returns formatted proposal open date', () => {
  //   const { result } = renderHook(() => useOSDAccessors());
  //   expect(result.current.osdOpens(false)).toBe('2025-09-01T08:00:00');
  //   expect(result.current.osdOpens(true)).toBe(
  //     'date(2025-09-01T08:00:00) time(2025-09-01T08:00:00)'
  //   );
  // });

  // it('returns countdown string with correct values', () => {
  //   vi.useFakeTimers();
  //   vi.setSystemTime(new Date('2025-09-25T12:00:00'));

  //   const { result } = renderHook(() => useOSDAccessors());
  //   expect(result.current.osdCountdown).toBe('Cycle closes in 5d 0h 0m 0s');

  //   vi.useRealTimers();
  // });

  // it('returns countdown as zero when date has passed', () => {
  //   vi.useFakeTimers();
  //   vi.setSystemTime(new Date('2025-10-01T00:00:00'));

  //   const { result } = renderHook(() => useOSDAccessors());
  //   expect(result.current.osdCountdown).toBe('Cycle closes in 0d 0h 0m 0s');

  //   vi.useRealTimers();
  // });

  // it('updates countdown over time', () => {
  //   vi.useFakeTimers();
  //   vi.setSystemTime(new Date('2025-09-30T11:59:00'));

  //   const { result } = renderHook(() => useOSDAccessors());

  //   expect(result.current.osdCountdown).toBe('Cycle closes in 0d 0h 1m 0s');

  //   act(() => {
  //     vi.advanceTimersByTime(1000); // simulate 1 second
  //   });

  //   expect(result.current.osdCountdown).toBe('Cycle closes in 0d 0h 0m 59s');

  //   vi.useRealTimers();
  // });
});
