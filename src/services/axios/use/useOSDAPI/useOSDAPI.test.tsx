import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOSDAPI } from './useOSDAPI';
import ObservatoryData from '@/utils/types/observatoryData';

const mockObservatoryData: ObservatoryData = {
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
  policies: [
    {
      cycleNumber: 42,
      cycleDescription: 'Cycle 42',
      cycleInformation: {
        cycleId: 'CYCLE-ID-2025',
        proposalOpen: '20250901T08:00:00',
        proposalClose: '20250930T12:00:00'
      },
      cyclePolicies: {
        maxDataProducts: 0,
        maxObservations: 0,
        maxTargets: 0,
        bands: [],
        low: [],
        mid: [],
        observationType: []
      },
      telescopeCapabilities: {
        mid: 'MID Telescope Description',
        low: 'LOW Telescope Description'
      },
      type: ''
    }
  ]
};

vi.mock('@ska-telescope/ska-gui-local-storage', () => ({
  storageObject: {
    useStore: () => ({
      application: {
        content3: null
      },
      updateAppContent3: vi.fn()
    })
  }
}));

vi.mock('../../axiosAuthClient/axiosAuthClient', () => ({
  default: () => 'mock-auth-client'
}));

vi.mock('../../get/getObservatoryData/getObservatoryData', () => ({
  default: vi.fn(() => Promise.resolve(mockObservatoryData))
}));

describe('useOSDAPI hook', () => {
  it('fetches and returns observatory data', async () => {
    const mockErrorSetter = vi.fn();
    const { result } = renderHook(() => useOSDAPI(mockErrorSetter));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.osdData?.policies[0].cycleNumber).toBe(42);
    expect(result.current.osdData?.capabilities?.low?.basicCapabilities?.minFrequencyHz).toBe(50);
    expect(mockErrorSetter).not.toHaveBeenCalled();
  });

  it('handles invalid response format', async () => {
    const mockErrorSetter = vi.fn();
    const getObservatoryData = await import('../../get/getObservatoryData/getObservatoryData');
    (getObservatoryData.default as any).mockImplementationOnce(() =>
      Promise.resolve({ invalid: true })
    );

    const { result } = renderHook(() => useOSDAPI(mockErrorSetter));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.osdData).toBeNull();
    expect(mockErrorSetter).toHaveBeenCalledWith('Invalid observatory data format received.');
  });

  it('handles fetch error', async () => {
    const mockErrorSetter = vi.fn();
    const getObservatoryData = await import('../../get/getObservatoryData/getObservatoryData');
    (getObservatoryData.default as any).mockImplementationOnce(() =>
      Promise.reject(new Error('Network error'))
    );

    const { result } = renderHook(() => useOSDAPI(mockErrorSetter));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.osdData).toBeNull();
    expect(mockErrorSetter).toHaveBeenCalledWith('Network error');
  });
});
