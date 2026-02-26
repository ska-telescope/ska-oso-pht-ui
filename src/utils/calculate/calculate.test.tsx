import { describe, it, expect } from 'vitest';
import { calculateCentralFrequency, calculateContinuumBandwidth } from '../calculate/calculate';
import { SA_AA2 } from '../constants';

const mockCapabilitiesLOW = {
  basicCapabilities: {
    minFrequencyHz: 10_000_000,
    maxFrequencyHz: 20_000_000
  },
  subArrays: [{ subArray: SA_AA2, availableBandwidthHz: 1_000_000_000, channelWidthHz: 1_000_000 }]
};

const mockCapabilitiesMID = {
  basicCapabilities: {
    receiverInformation: [{ rxId: SA_AA2, minFrequencyHz: 100, maxFrequencyHz: 200 }]
  },
  subArrays: [{ subArray: SA_AA2, availableBandwidthHz: 1_000_000_000 }]
};

describe('calculateCentralFrequency', () => {
  it('returns midpoint for LOW basicCapabilities', () => {
    const result = calculateCentralFrequency(mockCapabilitiesLOW, SA_AA2);
    expect(result).toBe((10_000_000 + 20_000_000) / 2);
  });

  it('returns midpoint for MID receiverInformation', () => {
    const result = calculateCentralFrequency(mockCapabilitiesMID, SA_AA2);
    expect(result).toBe((100 + 200) / 2);
  });

  it('returns 0 when no matching data exists', () => {
    const result = calculateCentralFrequency({}, SA_AA2);
    expect(result).toBe(0);
  });
});

describe('calculateContinuumBandwidth', () => {
  it('returns bandwidth for LOW', () => {
    const result = calculateContinuumBandwidth(mockCapabilitiesLOW, SA_AA2);
    expect(result).toBe(1_000_000_000);
  });

  it('returns bandwidth for MID', () => {
    const result = calculateContinuumBandwidth(mockCapabilitiesMID, SA_AA2);
    expect(result).toBe(1_000_000_000);
  });

  it('returns 0 when subArray not found', () => {
    const result = calculateContinuumBandwidth({ subArrays: [] }, SA_AA2);
    expect(result).toBe(0);
  });
});
