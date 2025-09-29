import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOSD } from './useOSD'; // adjust path if needed

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
                numberStations: 256,
                numberSubstations: 64,
                maxBaselineKm: 65,
                availableBandwidthHz: 1000000,
                cbfModes: ['modeA', 'modeB'],
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

describe('useOSD hook', () => {
  it('returns valid ObservatoryData object', () => {
    const { result } = renderHook(() => useOSD());
    const osd = result.current;

    expect(osd.capabilities.low.basicCapabilities.minFrequencyHz).toBe(50);
    expect(osd.capabilities.mid.basicCapabilities.receiverInformation[0].rxId).toBe('B1');
    expect(osd.observatoryPolicy.cycleNumber).toBe(42);
    expect(osd.observatoryPolicy.cycleInformation.cycleId).toBe('CYCLE-ID-2025');
  });
});
