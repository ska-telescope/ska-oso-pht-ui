import { describe, it, expect } from 'vitest';
import { calculateCentralFrequency, calculateContinuumBandwidth } from '../calculate/calculate';
import { SA_AA2 } from '../constants';

const mockCapabilitiesLOW = {
  minFrequencyHz: 10000000,
  maxFrequencyHz: 20000000,
  subArrays: [{ subArray: SA_AA2, availableBandwidthHz: 1000000000, channelWidthHz: 1000000 }]
};

const mockCapabilitiesMID = {
  receiverInformation: [{ rxId: SA_AA2, minFrequencyHz: 100, maxFrequencyHz: 200 }],
  subArrays: [{ subArray: SA_AA2, availableBandwidthHz: 1000000000, channelWidthHz: 1000000 }]
};

describe('Calculate Central Frequency', () => {
  it('should return the correct value for LOW', () => {
    const result = calculateCentralFrequency(mockCapabilitiesLOW, SA_AA2);
    expect(result).toBe(0);
  });

  it('should return the correct value for MID', () => {
    const result = calculateCentralFrequency(mockCapabilitiesMID, SA_AA2);
    expect(result).toBe(0);
  });
});

describe('Calculate Continuum Bandwidth', () => {
  it('should return the correct value for LOW', () => {
    const result = calculateContinuumBandwidth(mockCapabilitiesLOW, SA_AA2);
    expect(result).toBe(1000000000);
  });

  it('should return the correct value for MID', () => {
    const result = calculateContinuumBandwidth(mockCapabilitiesMID, SA_AA2);
    expect(result).toBe(1000000000);
  });
});
